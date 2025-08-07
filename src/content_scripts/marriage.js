const info = {
  maleInfo: {
    name: { value: '刘XX', editor: '#xmnan', },
    id: { value: '610102XXXXXXXXXXXX', editor: '#sfzjhmnan', },
    degree: { value: '大学', editor: '#whcdnan', },
    job: { value: '专业技术人员', editor: '#zynan', },
    phone: { value: '155XXXXXXXX', editor: '#lxdhnan', },
  },

  femaleInfo: {
    name: { value: '卢XX', editor: '#xmnv', },
    id: { value: '42XXXXXXXXXXXXXXXX', editor: '#sfzjhmnv', },
    degree: { value: '硕士研究生', editor: '#whcdnv', },
    job: { value: '其他从业人员', editor: '#zynv', },
    phone: { value: '158XXXXXXXX', editor: '#lxdhnv', },
  },

  address: {
    date: '2025-08-22', // 默认办理日期
    city: '440100000000', // 默认办理城市：广州市
    // 意向办理网点列表，若优先级高的网点没有可预约时间，则依次尝试优先级低的网点
    officeList: [
      '4401040A0000', // 广州市越秀区民政局婚姻登记处
      '4401050A0000', // 广州市海珠区民政局婚姻登记处
      '4401060A0000', // 广州市天河区民政局婚姻登记处
    ],
    // 意向办理时间列表，若优先级高的时段没有可预约时间，则依次尝试优先级低的时段
    timeList: [
      '15:30-16:30',
      '14:30-15:30',
      '14:00-14:30',
      '13:30-14:00',
      '13:00-13:30',
      '11:00-11:30',
      '10:00-11:00',
      '9:00-10:00',
    ],
  },

  notifyValue: '01', // 短信通知选择 01: 男 02: 女
}

// https://www.gdhy.gov.cn/yyjh.do?do=preYyxxOper&yyrq=2022-05-19&djjg=4403040A1000&yysj=16:30-17:00&ydbllx=01

const find = (selector) => {
  return document.querySelector(selector);
};
const sendMessage = chrome.runtime.sendMessage;
const onMessage = chrome.runtime.onMessage;

const Page = {
  autoClickEntryButton() {
    // page 1
    const button = find('a[href="/wsyy/yyjh.jsp"]');
    button.click();
  },

  autoClickNextButton() {
    // page 2
    const nextButton = find('input[class="btn_1"]');
    nextButton.click();
  },

  autoFillTimeAndBase() {
    // page 3
    const dateEditor = find('#yyrq');
    dateEditor.value = info.address.date;
    const baseEditor = find('select[name="blcs"]');
    baseEditor.value = info.address.city;
    const queryButton = find('a[class="querybtn"]');
    queryButton.click();
  },

  autoFillOfficeAndTime() {
    // page 5
    // 按优先级选择办理网点
    const officeList = info.address.officeList;
    let selectedOffice = false;
    
    for (let i = 0; i < officeList.length; i++) {
      const officeValue = officeList[i];
      const officeEditor = find(`input[type="radio"][name="djjg"][value="${officeValue}"]`);
      console.log(`尝试选择办理网点: ${officeValue}`, officeEditor);
      
      if (officeEditor && !officeEditor.disabled) {
        officeEditor.click();
        console.log(`成功选择办理网点: ${officeValue}`);
        selectedOffice = true;
        break;
      }
    }
    
    if (!selectedOffice) {
      console.log('没有找到可用的办理网点');
      // 如果都没有找到，尝试选择第一个可用的
      const firstAvailableOffice = find('input[type="radio"][name="djjg"]:not([disabled])');
      if (firstAvailableOffice) {
        firstAvailableOffice.click();
        console.log(`选择了第一个可用办理网点: ${firstAvailableOffice.value}`);
      }
    }
    
    // 按优先级选择时间段
    const timeList = info.address.timeList;
    let selectedTime = false;
    
    for (let i = 0; i < timeList.length; i++) {
      const timeValue = timeList[i];
      const timeEditor = find(`input[type="radio"][name="yysj"][value="${timeValue}"]`);
      console.log(`尝试选择时间段: ${timeValue}`, timeEditor);
      
      if (timeEditor && !timeEditor.disabled) {
        timeEditor.click();
        console.log(`成功选择时间段: ${timeValue}`);
        selectedTime = true;
        break;
      }
    }
    
    if (!selectedTime) {
      console.log('没有找到可用的时间段');
      // 如果都没有找到，尝试选择第一个可用的
      const firstAvailableTime = find('input[type="radio"][name="yysj"]:not([disabled])');
      if (firstAvailableTime) {
        firstAvailableTime.click();
        console.log(`选择了第一个可用时间段: ${firstAvailableTime.value}`);
      }
    }

    // 跳转下一步
    const nextButton = find('input[class="btn_1"]');
    nextButton.click();
  },

  autoFillCoupleInfoForm() {
    // page 4
    const maleInfo = info.maleInfo;
    const femaleInfo = info.femaleInfo;
    [maleInfo, femaleInfo].forEach(_info => {
      const blurEvent = new Event('blur');
      const keys = Object.keys(_info);
      keys.forEach(key => {
        const { value, editor } = _info[key];
        const editorElement = find(editor);
        editorElement.value = value;
        if (key === 'id') {
          editorElement.dispatchEvent(blurEvent);
        }
      });
    });

    // 预约成功通知选择
    const notifyEditor = find(`input[name="dxtzf"][value="${info.notifyValue}"]`);
    notifyEditor.click();

    // 点击获取验证码
    setTimeout(() => {
      const getCodeButton = find('#sms_get');
      getCodeButton.click();
    }, 200);
  },
  
  bindEvent: function() {
    const that = this;
    window.addEventListener('load', () => {
      sendMessage({ action: 'PAGE_LOAD', });
    }, false);
    
    onMessage.addListener(function(req, sender, sendResponse) {
			console.log(req);
      const { action } = req;
      if (action === 'FILL_PAGE_1') {
        sendResponse('自动跳转去结婚登记流程');
        that.autoClickEntryButton();
      } else if (action === 'FILL_PAGE_2') {
        sendResponse('自动跳转至选择办理网点及时间');
        that.autoClickNextButton();
      } else if (action === 'FILL_PAGE_3') {
        // 自动选择预约民政局和日期
        that.autoFillTimeAndBase();
        sendResponse('自动选择日期和结婚所在市');
      } else if (action === 'FILL_PAGE_4') {
        // 填充人员信息
        that.autoFillCoupleInfoForm();
        sendResponse('自动填写新人信息！！！！！');
      } else if (action === 'FILL_PAGE_5') {
        // 自动选择办理网点和时间
        that.autoFillOfficeAndTime();
        sendResponse('自动选择办理网点和时间');
      } else {
        sendResponse('page received order from extension, but do not know what.')
      }
		});
  },

  init: function() {
    this.bindEvent();
  },
};

Page.init();
