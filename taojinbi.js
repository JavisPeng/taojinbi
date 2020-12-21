auto.waitFor() //等待开启无障碍服务 

//===================用户可编辑参数===================
var MAX_EPOCH = 101 //最大执行次数
var wait_sec = 15 //任务执行默认等待的时长 考虑到网络卡顿问题 默认15秒
var do_dice_task = 1 // 1表示自动执行[淘宝人生掷色子任务]，0表示跳过不执行
var do_baba_farm_task = 1 // 1表示自动执行[芭芭农场任务]，0表示跳过不执行
var do_xiaoxiaole_task = 1 // 1表示自动执行[消消乐任务]，0表示跳过不执行
var do_tianmao_task = 1 //1表示执行[去天猫APP领红包任务]，0表示跳过不执行
var do_huoli_task = 1 // 1表示在执行完淘金币后自动执行[活力中心]任务，0表示跳过不执行
var taojinbi_reg_str = "逛|浏览|聚划算|天猫国际|看" //简单任务主题关键字，若有新的浏览任务出现可在此添加
var not_taojinbi_reg_str = '农场|消消乐|淘宝人生|逛好店领|小鸡|蚂蚁|淘宝成就' //需要在淘金币简单浏览任务中,跳过不执行的主题关键字
var is_earn_10coin = 1 //是否在逛好店任务中也执行领10金币任务(10s+10金币)  默认执行 1
var is_collect_shop = 0 //是否在10金币任务中关注商铺(关注商铺+10金币)  默认不执行 0
var is_show_choice = 1 //是否在启动时,显示特殊截图任务的选择框(生成app时使用) 默认显示
var num_ant_find = 32 //在蚂蚁森林执行找能量的次数,0表示直接返回不收取能量,默认32


//===================通用函数=========================
//点击控件
function btn_click(x) { if (x) return x.click() }

//点击控件所在坐标
function btn_position_click(x) { if (x) click(x.bounds().centerX(), x.bounds().centerY()) }

//消息提示
function toast_console(msg, tshow) {
    console.log(msg);
    if (tshow) toast(msg);
}

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
            //console.log(point);
            click(point.x, point.y); return true
        }
        sleep(1000)
    }
    return false
}

//===================业务逻辑函数=========================

//获取[浏览以下商品]的所在组控件数
function get_group_count() {
    let x = textContains('浏览以下商品').findOne(5)
    if (x) return x.parent().childCount()
    return 0
}

//等待sec秒，有完成提示后立即返回
function wait(sec) {
    let t_sec = sec
    let pre_num = 0  //[浏览以下商品]的所在组控件数有时会变化
    while (sec--) {
        let a1 = textMatches('点我领取奖励|任务已完成快去领奖吧|任务完成|任务已完成|任务已经全部完成啦').findOne(10)
        let cur_num = get_group_count()
        let a10 = pre_num > 0 && cur_num != pre_num; pre_num = cur_num
        let a = descMatches('任务完成|快去领奖吧').findOne(1000)
        if (a1 || a10 || a) {
            toast_console('到时立即返回')
            return true
        }
    }
    toast_console('等待' + t_sec + 's返回');
    return true
}

//根据正则表达式获取任务
function get_task(key_reg_str, not_key_reg_str, btn_reg_str) {
    sleep(500); textMatches('每日来访领能量.+|已打卡').findOne(2000);
    if (btn_reg_str == undefined) btn_reg_str = '去完成|去施肥|去消除|去兑换'
    let list_x = textMatches(btn_reg_str).find()
    let reg = new RegExp(key_reg_str)
    let not_reg = not_key_reg_str == undefined ? new RegExp('z') : new RegExp(not_key_reg_str)
    for (let i = 0; i < list_x.length; i++) {
        let btn_x = list_x[i].parent().child(0).child(0)
        if (!btn_x) continue
        let txt = btn_x.text() //主标题
        if ((reg.test(txt) && !not_reg.test(txt))) {
            toast_console(txt)
            let obj = new Object(); obj.x = list_x[i]; obj.txt = txt;
            return obj
        }
    }
    return null
}

//淘金币获取奖励
function get_rewards() {
    sleep(500); btn_click(text('领取奖励').findOne(1000)); sleep(3000) //等待调整布局
}

//确保任务按钮被单击，解决单击时布局发生改变的问题
function assure_click_task(name, list_task_reg) {
    if (list_task_reg == undefined) list_task_reg = '打开任务面板|今日任务'
    let obj = null
    for (let i = 0; i < 3; i++) {
        obj = get_task(name)
        if (!obj) return false
        if (obj.x) break
    }
    if (!obj.x) {
        toast_console('无法找到[' + name + '任务],请确保其在未完成任务列表中'); return false
    }
    obj.x.click();
    return true
}

function assure_back(list_task_reg) {
    if (list_task_reg == undefined) list_task_reg = '打开任务面板|今日任务'
    let num = 8
    while (num-- && !textMatches(list_task_reg).findOne(1000)) back()
}


//芭芭农场任务
function baba_farm_task() {
    toast_console('查看-芭芭农场任务')
    if (!assure_click_task('农场')) return
    sleep(6000)
    //金色获取肥料按钮
    cs_click(6, '#fed362', 0.5, 0.45, 0.45, 0.25)
    sleep(1000); btn_position_click(text('去施肥，赚更多肥料').findOne(1000)); sleep(500)
    //签到列表领肥料
    if (cs_click(3, '#9dbe77', 0.66, 0.66, 0.25, 0.25)) {
        console.log('打开签到列表领肥料'); sleep(1000)
        btn_click(text('去签到').findOne(1000))
        btn_click(text('去领取').findOne(1000))
        btn_click(text('关闭').findOne(1000)); sleep(1000)
    }
    //金色施肥按钮
    cs_click(3, '#fff39f', 0.45, 0.6, 0.25, 0.35)
    sleep(500); assure_back(); get_rewards()
}

//淘宝成就签到
function achievement_signin_task() {
    toast_console('查看-淘宝成就签到任务')
    if (!assure_click_task('淘宝成就')) return
    btn_click(text("成就礼包").findOne(3000))
    btn_click(text("我收下了").findOne(1000))
    let btn_x = text('成就签到').findOne(2000)
    if (btn_x) {
        btn_x.parent().child(3).click()
    }
    btn_click(text("我收下了").findOne(1000))
    sleep(1000); assure_back(); get_rewards()
}

//签到领话费充值金
function signin_phonecharge_task(sec) {
    toast_console('查看-领话费充值金薅羊毛任务')
    if (!assure_click_task('签到领话费充值金|羊毛')) return
    btn_click(text('立即领取').findOne(6000))
    sleep(sec * 1000); assure_back(); get_rewards()
}

//喂小鸡任务，可以直接返回
function feed_chick_task() {
    toast_console('查看-蚂蚁庄园喂小鸡任务')
    if (!assure_click_task('小鸡')) return
    sleep(1000); btn_click(text('取消').findOne(2000));
    assure_back(); get_rewards()
}

//蚂蚁森林任务
function ant_forest_task() {
    toast_console('查看-蚂蚁森林任务')
    if (!assure_click_task('蚂蚁森林')) return
    sleep(2000)
    let num = 5
    while (num-- && !text('最新动态').findOne(1000));
    if (num_ant_find && text('最新动态').findOne(500)) {
        let img = captureScreen(); console.hide()
        let point = findColor(img, '#ff6e01', { region: [img.getWidth() * 0.7, img.getHeight() * 0.6, img.getWidth() * 0.2, img.getHeight() * 0.2], threshold: 8 })
        for (let i = 0; i < num_ant_find; i++) {
            for (let j = 0; j < 8; j++) {
                if (!cs_click(1, '#b6ff00', 0.1, 0.2, 0.8, 0.5)) break
                sleep(400)
            }
            click(point.x, point.y); sleep(1500)
            if (!text('最新动态').findOne(1000)) break
            toast_console('找能量/' + i, true)
        }
    }
    console.show(); assure_back(); get_rewards()
}

//逛好店并领10金币
function shop_10coin_task() {
    toast_console('查看-逛好店并领10金币任务')
    if (!assure_click_task('逛好店领')) return
    for (let i = 0; i < 10 && is_earn_10coin; i++) {
        let btn_x = desc('逛10秒+10').findOne(2000)
        toast_console('逛10秒+10金币/' + (i + 1))
        if (!btn_x) break
        btn_x.parent().click(); sleep(12500);
        if (is_collect_shop) {
            click('关注+10'); sleep(500);
        }
        back(); sleep(800);
    }
    wait(wait_sec); assure_back(); get_rewards()
}

//100淘金币夺宝任务
function duobao_task() {
    toast_console('查看-100淘金币夺宝任务')
    if (!assure_click_task('100淘金币')) return
    wait(wait_sec); assure_back(); sleep(1000)
    for (let i = 0; i < 3; i++) {
        let list_btn = className('android.view.View').clickable(true).find()
        if (list_btn.length > 16) {
            list_btn[list_btn.length - 3].click(); break
        }
        sleep(1000)
    }
    get_rewards()
}

//去天猫红包任务
function tianmao_task() {
    toast_console('查看-去天猫APP领红包任务')
    if (!assure_click_task('去天猫APP领红包')) return
    sleep(4000)
    if (text('攻略').findOne(5000)) wait(wait_sec)
    assure_back(); get_rewards()
}

//掷骰子任务
function dice_task() {
    toast_console('查看-淘宝人生逛街领能量掷骰子任务')
    if (!assure_click_task('淘宝人生逛街领能量')) return
    sleep(7000)
    //去他大爷的神秘礼物
    toast_console('掷骰子任务-查看是否有神秘礼物(QTM的神秘)')
    cs_click(3, '#ffffff', 0.3, 0.1, 0.3, 0.5, true);
    //单击礼包
    toast_console('掷骰子任务-查看是否有礼包(QTM的礼包)')
    cs_click(2, '#fee998', 0.3, 0.2, 0.4, 0.4);
    //橙色收下奖励按钮按钮
    toast_console('掷骰子任务-点击6次开心收下按钮(一点都不开心- -)')
    for (let i = 0; i < 6; i++) {
        cs_click(1, '#ff7d44', 0.1, 0.15, 0.2, 0.5, true); sleep(500)
    }
    sleep(1000)
    //金色前进按钮
    toast_console('掷骰子任务-尝试点击色子前进')
    cs_click(8, '#fff89d', 0.2, 0.5, 0.45, 0.3); sleep(3000)
    //橙色收下奖励按钮按钮
    cs_click(2, '#ff7d44', 0.1, 0.15, 0.2, 0.5, true);
    back(); sleep(1000)
    //橙色返回淘宝按钮
    cs_click(3, '#ff7d44', 0.1, 0.15, 0.2, 0.5, true)
    btn_click(text('立刻离开').findOne(1000)); get_rewards()
}

//消消乐任务
function xiaoxiaole_task() {
    toast_console('查看-消消乐任务')
    if (!assure_click_task('消消')) return
    sleep(8000);
    console.log('消消乐,等待进入游戏界面'); console.hide()
    //开心收下奖励
    cs_click(4, '#11c6bf', 0.2, 0.6, 0.3, 0.3);
    //第一次返回没有主页按钮?//back(); sleep(1000); cs_click(3, '#ffffff', 0.6, 0.2, 0.3, 0.5); sleep(500); //单击关闭图标 
    //回到主页
    console.log('消消乐,回到游戏首页');
    for (let i = 0; i < 8; i++) {
        back(); sleep(1000)
        if (cs_click(2, '#ffbd29', 0.2, 0.5, 0.45, 0.45)) break
    }
    sleep(3000) //过渡动画
    //邮件领取 pass
    cs_click(3, '#ffffff', 0.65, 0.15, 0.3, 0.5); sleep(500)
    //滑到屏幕下方
    for (let i = 0; i < 8; i++)swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 5, 500)
    //点击第一关 绿色圆圈
    sleep(1000); cs_click(3, '#63cbc4', 0.5, 0.3, 0.4, 0.4, true); sleep(2000)
    console.log('消消乐，点击第一关');
    //开始 绿色方块
    cs_click(3, '#11c6bf', 0.3, 0.5, 0.3, 0.3); sleep(5000)
    //消除方块,兼容不同机型
    console.log('消消乐，开始消除方块');
    let rgb = '#fff0e0'
    img = captureScreen()
    let point1 = findColor(img, rgb, { region: [img.getWidth() * 0.2, img.getHeight() * 0.2, img.getWidth() * 0.4, img.getHeight() * 0.4], threshold: 4 })
    img = images.rotate(img, 180)
    let point2 = findColor(img, rgb, { region: [img.getWidth() * 0.2, img.getHeight() * 0.2, img.getWidth() * 0.4, img.getHeight() * 0.4], threshold: 4 })
    if (point1 && point2) {
        let box_x = (img.getWidth() - point2.x - point1.x) / 5
        let box_y = (img.getHeight() - point2.y - point1.y) / 6
        list_xy = [[0, 1, 0, 2], [0, 5, 0, 4], [2, 2, 3, 2]]
        list_xy.forEach(xy => {
            x1 = (xy[0] + 0.5) * box_x + point1.x; x2 = (xy[2] + 0.5) * box_x + point1.x
            y1 = (xy[1] + 0.5) * box_y + point1.y; y2 = (xy[3] + 0.5) * box_y + point1.y
            swipe(x1, y1, x2, y2, 800); sleep(1200)
        });
    }
    back(); sleep(800);
    //回到主页1 灰色的暂时离开
    cs_click(2, '#9d6031', 0.2, 0.2, 0.4, 0.5, true)
    //回到主页2 金色的回到主页
    cs_click(2, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(2000);
    //返回淘宝按钮
    back(); sleep(800); cs_click(3, '#ff6e09', 0.2, 0.75, 0.45, 0.2); console.show()
    get_rewards()
}

//执行简单的浏览任务
function do_simple_task(epoch, sec, reg_str, not_reg_str, list_task_reg, btn_reg_str) {
    toast_console('查看-可执行的简单浏览任务')
    for (let i = 0; i < epoch; i++) {
        let obj = get_task(reg_str, not_reg_str, btn_reg_str)
        if (!obj) {
            console.log('简单浏览任务执行完毕'); break
        }
        if (!obj.x) {
            console.log('继续执行简单浏览任务'); continue
        }
        obj.x.click();
        wait(sec)
        let num = 8
        while (num-- && !text(list_task_reg).findOne(1000)) {
            back(); btn_position_click(desc('继续退出').findOne(200))
            btn_click(textContains('残忍离开|回到淘宝|立即领取').findOne(1000))
        }
        get_rewards()
    }
}

function taojinbi_task() {
    let list_task_reg = '今日任务';
    if (!text(list_task_reg).findOne(1000)) {
        toast_console('启动淘宝app')
        app.launch('com.taobao.taobao');
        if (!text(list_task_reg).findOne(2000)) {
            let num = 8
            while (num-- && !desc('领淘金币').findOne(1000)) back();
            let btn_x = desc('领淘金币').findOne(500)
            if (!btn_x) {
                toast_console('无法返回到淘宝主界面,请手动回到淘宝主界面后重新运行'); exit()
            }
            btn_x.click(); toast_console('进入到淘金币主界面..')
            btn_click(text('签到领金币').findOne(3000)); btn_click(text('领取奖励').findOne(1000))
            btn_x = text('赚金币').findOne(3000)
            if (!btn_x) {
                toast_console('无法找到[赚金币]按钮,请重新运行程序'); exit()
            }
            btn_x.click()
        }
    }
    toast_console('进入到淘金币列表界面..'); textMatches('每日来访领能量.+').findOne(6000);
    let btn_reg_str = '去完成|去施肥'
    //防止特殊任务卡顿，所以任务默认执行2次
    for (let i = 0; i < 2; i++) {
        do_simple_task(MAX_EPOCH, wait_sec, taojinbi_reg_str, not_taojinbi_reg_str, list_task_reg, btn_reg_str)
        shop_10coin_task(); feed_chick_task()
        if (do_baba_farm_task) baba_farm_task()
        if (do_dice_task) dice_task()
        if (do_tianmao_task) tianmao_task()
        duobao_task(); achievement_signin_task(); signin_phonecharge_task(11); ant_forest_task()
        if (do_xiaoxiaole_task) xiaoxiaole_task()
        get_rewards()
    }
    toast_console('*****淘金任务执行完毕*****')
}

//=================活力中心的任务=====================


//活力步数兑换红包
function exchange_red_envelope_task() {
    toast_console('查看-活力步数兑换红包任务')
    if (!assure_click_task('步换红包')) return
    if (btn_click(text('去使用').findOne(1000))) {
        swipe(device.width / 2, device.height / 5, device.width / 2, device.height / 2, 500)
    }
    btn_click(textContains('免费领取').findOne(1000));
    sleep(1000); back()
}


function do_huoli_simple_task() {
    var key_reg_str = "逛|浏览|会场|挑战|开|C|活力步数|羊毛|天猫|店"
    let not_reg_str = '消消' //需要特殊执行的任务
    let btn_reg_str = "去领取|去浏览|去逛逛|去开启|去参赛|去夺宝|去挑战"
    let btn_back_imm = /去开启|去参赛|去夺宝|去挑战/   //按钮立即返回
    let key_back_imm = /太舞滑雪|爱攒油|金币小镇/   //主题关键字立即返回
    for (let i = 0; i < MAX_EPOCH; i++) {
        let sec = 17
        let obj = get_task(key_reg_str, not_reg_str, btn_reg_str)
        if (!obj) {
            toast_console('活力中心-简单浏览任务执行完毕'); break
        }
        obj.x.click()
        if (obj.txt.indexOf('活力步数') > -1) continue //活力步数直接领取
        if (btn_back_imm.test(obj.x.text()) || key_back_imm.test(obj.txt)) sec = 3
        if (obj.txt.indexOf('逛天猫燃冬季主会场') > -1) sec = 26
        if (obj.txt.indexOf('薅羊毛') > -1 || obj.txt.indexOf('淘宝人生') > -1) sec = 9
        wait(sec)
        let num = 8;
        while (num-- && !text('打开任务面板').findOne(1000)) {
            back()
            btn_click(text('残忍离开').findOne(500))
            if (obj.txt.indexOf('淘宝人生') > -1) cs_click(2, '#ff7d44', 0.15, 0.6, 0.45, 0.3)
        }
        sleep(1500) //等待布局调整
    }
}

function huoli_task() {
    toast_console('正在去活力中心的路上........')
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
            toast_console('打开活力中心任务面板')
            btn_x.click(); sleep(500)
            for (let i = 0; i < 2; i++) {
                btn_click(text('去打卡').findOne(1500));
                do_huoli_simple_task()
                exchange_red_envelope_task()
            }
            if (do_xiaoxiaole_task) xiaoxiaole_task()
            toast_console('***活力中心任务执行完毕***')
        }
    }
    toast_console('开始自动训练..')
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
//=================活力中心的任务=====================

function multi_choice() {
    do_dice_task = 0; do_baba_farm_task = 0; do_xiaoxiaole_task = 0; num_ant_find = 0; do_huoli_task = 0;
    let options = dialogs.multiChoice("(作者:Javis486)请选择需要额外执行的任务", ['淘宝人生掷色子任务', '逛农场领免费水果任务', '消消乐任务', '蚂蚁森林任务', '活力中心(淘金币完成后执行)'])
    options.forEach(option => {
        switch (option) {
            case 0:
                do_dice_task = 1; break;
            case 1:
                do_baba_farm_task = 1; break;
            case 2:
                do_xiaoxiaole_task = 1; break;
            case 3:
                num_ant_find = 32; break;
            case 4:
                do_huoli_task = 1; break;
        }
    });
}

//主函数
function main() {
    requestScreenCapture(false);
    if (is_show_choice) multi_choice();
    console.show();
    console.log('本APP完全免费，作者:Javis486，github下载地址：https://github.com/JavisPeng/taojinbi')
    taojinbi_task();
    if (do_huoli_task) huoli_task()
    toast_console('###***全部任务执行完毕***###')
}

main()
