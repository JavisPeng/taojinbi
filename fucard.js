var phone_number = '在此修改为你的手机号码'
var storage = storages.create("fu486");
const base_url = 'https://render.alipay.com/p/c/17yq18lq3slc?source='

function btn_click(x) { if (x) return x.click() }

function btn_position_click(x) { if (x) click(x.bounds().centerX(), x.bounds().centerY()) }

function get_code(pre_code) {
    let intent = new Intent();
    intent.setClassName("com.android.mms", "com.android.mms.ui.ConversationList");
    app.startActivity(intent); sleep(1000)
    btn_position_click(text('通知信息').findOne(1000)); sleep(1000)
    for (let i = 0; i < 20; i++) {
        btn_position_click(textContains('支付宝').findOne(1000)); sleep(1500)
        let list_code = textContains('支付宝验证码').find()
        if (list_code.length > 0) {
            let txt_code = list_code[list_code.length - 1]
            let code = txt_code.text().split('，')[0].split('：')[1]
            if (code != pre_code) {
                toast('获取到验证码:' + code)
                return code
            }
        }
        back(); sleep(1000);
    }
    toast('无法获取到验证码'); exit()
    return null
}

function fucard_from_code() {
    btn_position_click(text('我的').findOne(1000))
    let my_name = idContains('name').findOne(2000).text()
    btn_position_click(text('消息').findOne(1000)); sleep(1000)
    swipe(device.width * 0.5, device.height * 0.2, device.width * 0.5, device.height * 0.8, 500)
    btn_position_click(text('搜索').findOne(2000)); sleep(1000)
    let txt_search = text('搜索').findOne(2000)
    txt_search.setText(my_name); sleep(1000)
    btn_position_click(idContains('icon').findOne(2000)); sleep(1000)
    let list_code = ['JING_LING', 'FEI_ZHU', 'YOUKU_TV', 'PIAO_PIAO', 'TIAN_MAO', 'KAO_LA', 'CAI_NIAO', 'XINHUA_SHE', 'BAI_JINGTU', 'KE_CHUANG', 'KEJI_ZHIJIA', 'JIEFANG_RIBAO', 'DA_WAN', 'ZIJIN_SHAN', 'ZHONGGUO_LAN', 'CAI_LIFANG', 'ZHENG_GUAN', 'JIANGXI_XINWEN', 'YANG_CHENG', 'NAN_DU', 'SANYA_RIBAO', 'CHUNCHENG_WANBAO', 'GUIZHOU_DUSHIBAO', 'HUANG_HE', 'SHANXI_TOUTIAO', 'XINJING_BAO', 'JIN_YUN', 'CHONG_QING', 'LONGTOU_XINWEN', 'FENGKOU_CAIJING', 'QILU_WANBAO', 'GUOWU_YUAN', 'REN_SHE', 'YI_BAO', 'YUSHI_BAN', 'EHUI_BAN', 'SUISHEN_BAN', 'SHENZHEN_JIAOJING', 'GANFU_TONG', 'ANHUI_SHUIWU', 'WUXI_GONGJIJIN', 'SHANGHAI_GONGJIJIN', 'TIANFU_TONG', 'QINGDAN_DASHUJU', 'WANSHI_TONG', 'MINZHENG_TONG', 'MEI_TU', 'MEI_YAN', 'MANG_GUO', 'KUAI_SHOU', 'WANGYI_YUN', 'SHU_QI']
    toast('第一次获取验证码,备下次使用')
    let pre_code = get_code(null);
    app.launch('com.eg.android.AlipayGphone'); sleep(2000)
    for (let i = 0; i < list_code.length; i++) {
        if (storage.get(list_code[i], null)) continue
        let url = base_url + list_code[i]
        let chat_msg_edit = idContains('chat_msg_edit').findOne(1000)
        chat_msg_edit.setText(url); sleep(1000)
        let btn_send = text('发送').findOne(1000)
        if (btn_click(btn_send)) {
            sleep(1000); btn_position_click(textContains(url).findOne(1000))
            btn_click(text('开福气盲盒').findOne(2000))
            let edit_mobile = idContains('J-mobile').findOne(1000)
            if (text('活动暂未开始，敬请期待').findOne(1000)) {
                storage.put(list_code[i], 1); back(); sleep(1500)
                continue
            }
            edit_mobile.setText(phone_number)
            btn_click(text('发送验证码').findOne(1000))
            sleep(5000) //等待5秒获取验证码
            let code = get_code(pre_code)
            app.launch('com.eg.android.AlipayGphone');
            let edit_code = idContains('J-code').findOne(1000)
            edit_code.setText(code)
            if (btn_click(text('立即领取').findOne(2000))) {
                storage.put(list_code[i], 1);
                let num = 61
                while (num--) {
                    if (num % 3 == 0) toast((i + 1) + '/' + list_code.length + '让我们一起等待漫长的' + num + '秒');
                    sleep(1000)
                }
                back();
                pre_code = code
            }
        }
    }
}

fucard_from_code()
