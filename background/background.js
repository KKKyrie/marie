const onMessage = chrome.runtime.onMessage;
let currentPageInfo = null; // 存储当前页面信息

// 根据页面URL判断并执行相应的自动化操作
function handlePageAction(tabId, url) {
	console.log('处理页面自动化操作，URL:', url);
	
	let action = null;
	let delay = 0;
	
	if (url.indexOf('main.jsp') > 0) {
		// 首页
		action = 'FILL_PAGE_1';
	} else if (url.indexOf('yyjh.jsp') > 0) {
		// 双方基本信息页面
		action = 'FILL_PAGE_2';
		delay = 100;
	} else if (url.indexOf('yyjh.do?do=nextOper') > 0) {
		// 选择预约民政局及日期页
		action = 'FILL_PAGE_3';
	} else if (url.indexOf('yyjh.do?do=preYyxxOper') > 0) {
		// 双方信息页，这里不主动触发
		action = 'FILL_PAGE_4';
	} else if (url.indexOf('common.do?do=getWdrqxx') > 0) {
		// 选择办理网点及时间
		action = 'FILL_PAGE_5';
	}
	
	if (action) {
		const executeAction = () => {
			chrome.tabs.sendMessage(tabId, { action }, (response) => {
				if (chrome.runtime.lastError) {
					console.log('发送消息失败:', chrome.runtime.lastError.message);
				} else {
					console.log('自动化操作响应:', response);
				}
			});
		};
		
		if (delay > 0) {
			setTimeout(executeAction, delay);
		} else {
			executeAction();
		}
	}
}

// 监听来自content script的消息
onMessage.addListener(function(req, sender, sendResponse){
	let action = req.action;
	
	switch (action){
		case 'PAGE_LOAD':
			// 当页面加载时，存储页面信息
			currentPageInfo = {
				tabId: sender.tab.id,
				url: sender.tab.url,
				timestamp: Date.now()
			};

			// 直接在background中处理页面自动化逻辑
			handlePageAction(sender.tab.id, sender.tab.url);
			
			sendResponse('页面加载信息已记录并处理');
			break;
		case 'GET_CURRENT_PAGE_INFO':
			// popup可以请求当前页面信息
			sendResponse(currentPageInfo);
			break;
		case 'MANUAL_FILL_PAGE':
			// 处理来自popup的手动填充请求
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabs[0]) {
					chrome.tabs.sendMessage(tabs[0].id, { action: req.fillAction }, (response) => {
						console.log('手动填充响应:', response);
					});
				}
			});
			sendResponse('手动填充指令已发送');
			break;
		default:
			return;
	}
	
	// 确保异步操作正确处理
	return true;
});
