const find = function(selector) {
	return document.querySelector(selector);
}

const firstButton = find('#firstPageButton');
const secondButton = find('#secondPageButton');

const Reserver = {
	bindEvent: function() {
		firstButton.addEventListener('click', () => {
			this.requestManualFill('FILL_PAGE_2');
		}, false);

		secondButton.addEventListener('click', () => {
			this.requestManualFill('FILL_PAGE_4');
		}, false);
	},

	// 请求 background 执行手动填充
	requestManualFill: function(fillAction) {
		console.log('请求手动填充:', fillAction);
		chrome.runtime.sendMessage({
			action: 'MANUAL_FILL_PAGE',
			fillAction: fillAction
		}, (response) => {
			console.log('手动填充请求响应:', response);
		});
	},

	init: function() {
		this.bindEvent();
	}
};

Reserver.init();
