const find = function(selector) {
	return document.querySelector(selector);
}

const sendMessage = chrome.tabs.sendMessage;
const onMessage = chrome.runtime.onMessage;
const query = chrome.tabs.query;

const firstButton = find('#firstPageButton');
const secondButton = find('#secondPageButton');

const Reserver = {
	bindEvent: function() {
		const that = this;

		// 监听来自 content_script 的消息
		onMessage.addListener(function(req, sender, sendResponse) {
			if (req.action === 'PAGE_LOAD') {
				that.getCurrentPageAction();
			}
		});

		firstButton.addEventListener('click', () => {
			that.fillThePage(2);
		}, false);

		secondButton.addEventListener('click', () => {
			that.fillThePage(4);
		}, false);
	},

	// 发指令到 content_script, 填充页面信息
	fillThePage: (page) => {
		query(
			{ active: true, currentWindow: true, },
			function(tabs) {
				sendMessage(tabs[0].id, {
					action: `FILL_PAGE_${page}`,
				}, function(res) {
					console.log(res);
				});
			},
		);
	},

	getCurrentPageAction: function() {
		const that = this;
		chrome.tabs.getSelected(null, function (tab) {
			// 根据当前页面 url 向 content_script 发送不同的指令
			const url = tab.url;
			console.log(url);
			if (url.indexOf('main.jsp') > 0) {
				// 首页
				that.fillThePage(1);
			} else if (url.indexOf('yyjh.jsp') > 0) {
				// 双方基本信息页面
				setTimeout(() => {
					that.fillThePage(2);
				}, 1000);
			} else if (url.indexOf('yyjh.do?do=nextOper') > 0) {
				// 选择预约民政局及日期页
				that.fillThePage(3);
			} else if (url.indexOf('yyjh.do?do=preYyxxOper') > 0) {
				// 双方信息页，这里不主动触发
				that.fillThePage(4)
			}
		});
	},

	init: function() {
		this.bindEvent();
	}
};

Reserver.init();
