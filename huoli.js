auto.waitFor() //等待开启无障碍服务 

//点击控件
function btn_click(x) { if (x) return x.click() }

// 截屏查找图片颜色并单击对应的点
function cs_click(num, rgb, xr, yr, wr, hr, flipup) {
    while (num--) {
        let img = captureScreen()
        if (flipup != undefined) img = images.rotate(img, 180)
        let point = findColor(img, rgb, { region: [img.getWidth() * xr, img.getHeight() * yr, img.getWidth() * wr, img.getHeight() * hr], threshold: 8 })
        if (point) {
            if (flipup != undefined) {
                point.x = img.getWidth() - point.x; point.y = img.getHeight() - point.y
            }
            click(point.x, point.y); return true
        }
        sleep(1000)
    }
    return false
}

function wait(sec) {
    let t_sec = sec
    while (sec--) {
        let a1 = textMatches('点我领取奖励|任务已完成快去领奖吧|任务完成|任务已完成|任务已经全部完成啦').findOne(10)
        let a = descMatches('任务完成|快去领奖吧').findOne(1000)
        if (a1 || a) {
            console.log('到时立即返回')
            return true
        }
    }
    console.log('等待' + t_sec + 's返回');
    return true
}

//根据正则表达式获取任务
function get_task(key_reg_str, not_key_reg_str, btn_reg_str) {
    sleep(500); textMatches('每日来访领能量.+').findOne(2000);
    if (btn_reg_str == undefined) btn_reg_str = '去完成|去施肥|去领取|去兑换'
    let list_x = textMatches(btn_reg_str).find()
    let reg = new RegExp(key_reg_str)
    let not_reg = not_key_reg_str == undefined ? new RegExp('z') : new RegExp(not_key_reg_str)
    for (let i = 0; i < list_x.length; i++) {
        let btn_x = list_x[i].parent().child(0).child(0)
        if (!btn_x) continue
        let txt = btn_x.text() //主标题
        if ((reg.test(txt) && !not_reg.test(txt))) {
            console.log(txt)
            let obj = new Object(); obj.x = list_x[i]; obj.txt = txt;
            return obj
        }
    }
    return null
}

//活力步数兑换红包
function exchange_red_envelope_task() {
    let obj = get_task('步换')
    if (!obj) return
    obj.x.click(); sleep(800)
    if (btn_click(text('去使用').findOne(1000))) {
        swipe(device.width / 2, device.height / 5, device.width / 2, device.height / 2, 500)
    }
    btn_click(textContains('免费领取').findOne(1000)); sleep(500); back()
}

function do_huoli_simple_task() {
    let MAX_EPOCH = 101
    let key_reg_str = "逛|浏览|会场|挑战|开|C|活力步数|羊毛|天猫|店"
    let not_reg_str = '消消' //需要特殊执行的任务
    let btn_reg_str = "去领取|去浏览|去逛逛|去开启|去参赛|去夺宝|去挑战"
    let btn_back_imm = /去开启|去参赛|去夺宝|去挑战/   //按钮立即返回
    let key_back_imm = /太舞滑雪|爱攒油|金币小镇|淘宝人生/   //主题关键字立即返回
    for (let i = 0; i < MAX_EPOCH; i++) {
        let sec = 17
        let obj = get_task(key_reg_str, not_reg_str, btn_reg_str)
        if (!obj) {
            console.log('活力中心-简单浏览任务执行完毕'); break
        }
        obj.x.click()
        if (obj.txt.indexOf('活力步数') > -1) continue //活力步数直接领取
        if (btn_back_imm.test(obj.x.text()) || key_back_imm.test(obj.txt)) sec = 3
        if (obj.txt.indexOf('逛天猫燃冬季主会场') > -1) sec = 26
        // if (obj.txt.indexOf('薅羊毛') > -1) sec = 17
        if (obj.txt.indexOf('淘宝人生') > -1) sec = 3
        wait(sec)
        let num = 8;
        while (num-- && !text('做任务赢奖励').findOne(1000)) {
            back()
            btn_click(textContains('残忍离开|回到淘宝|立即领取|残忍拒绝').findOne(500))
            if (obj.txt.indexOf('淘宝人生') > -1) cs_click(2, '#ff7d44', 0.15, 0.6, 0.45, 0.3)
        }
        sleep(1500) //等待布局调整
    }
}

function huoli_task() {
    requestScreenCapture(false);
    console.show()
    console.log('正在去活力中心的路上........')
    app.launch('com.taobao.taobao'); sleep(1000)
    let num = 8; let list_task_reg = '打开任务面板';
    while (num-- && !desc('我的淘宝').findOne(1000)) back()
    let btn_x = desc('我的淘宝').findOne(1000)
    if (btn_x) {
        btn_x.click()
        btn_x = text('活力中心').findOne(1000)
        if (btn_x) btn_x.parent().child(0).click(); sleep(1000)
        btn_x = text(list_task_reg).findOne(2000)
        if (btn_x) {
            console.log('打开活力中心任务面板')
            btn_x.click(); sleep(500)
            for (let i = 0; i < 2; i++) {
                btn_click(text('去打卡').findOne(1500));
                do_huoli_simple_task()
                exchange_red_envelope_task()
            }
            console.log('***活力中心任务执行完毕***')
        }
    }
    console.log('开始自动训练..')
    btn_click(text('关闭').findOne(1000))
    for (let i = 0; i < 36; i++) {
        btn_click(text('训练').findOne(1000)); sleep(200)
        if (!btn_click(text('开心收下').findOne(400)) && !text('训练').findOne(400)) {
            let list_btn = text('').className('Button').clickable(true).find()
            if (list_btn.length > 0) list_btn[list_btn.length - 1].click()
        }
        console.log("训练/", i + 1);
    }
}

huoli_task()
