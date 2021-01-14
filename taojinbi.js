"ui";
auto() //开启无障碍服务 //auto.waitFor()和"ui";有冲突会导致卡死?

if (floaty && floaty.hasOwnProperty("checkPermission") && !floaty.checkPermission()) {
    floaty.requestPermission(); toast("请先开启悬浮窗权限再运行,否则无法显示提示"); exit()
}

//===================用户可编辑参数===================
//所有任务重复次数,解决新增任务问题
var MAX_ALL_TASK_EPOCH = 2
//浏览任务最大执行次数
var MAX_EPOCH = 101
//任务执行默认等待的时长 考虑到网络卡顿问题 默认15秒
var wait_sec = 15
//简单任务主题关键字，若有新的浏览任务出现可在此添加
var taojinbi_reg_str = "逛|浏览|聚划算|天猫国际|看"
//需要在淘金币简单浏览任务中,跳过不执行的主题关键字
var not_taojinbi_reg_str = '农场|消消乐|淘宝人生|逛好店领|小鸡|蚂蚁|淘宝成就'

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
            return click(point.x, point.y);
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
    sleep(500); textMatches('每日来访领能量.+').findOne(2000);
    if (btn_reg_str == undefined) btn_reg_str = '去完成|去施肥|去领取'
    let list_x = textMatches(btn_reg_str).find()
    let reg = new RegExp(key_reg_str)
    let not_reg = not_key_reg_str == undefined ? new RegExp('javis486') : new RegExp(not_key_reg_str)
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
function assure_click_task(name, not_key_reg_str, btn_reg_str) {
    let obj = null
    for (let i = 0; i < 3; i++) {
        obj = get_task(name, not_key_reg_str, btn_reg_str)
        if (!obj) return false
        if (obj.x) break
    }
    if (!obj.x) {
        toast_console('无法找到[' + name + '任务],请确保其在未完成任务列表中'); return false
    }
    obj.x.click();
    return true
}

//保证返回到任务界面
function assure_back(list_task_reg) {
    if (list_task_reg == undefined) list_task_reg = '做任务赚金币'
    let num = 8
    while (num-- && !text(list_task_reg).findOne(1000)) {
        back()
        btn_click(text("残忍离开").findOne(500))
    }
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
function haul_wool_task(sec) {
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

//蚂蚁森林偷取能量
function steal_energy(num_find) {
    let num = 5
    while (num-- && !text('最新动态').findOne(1000)) sleep(500);
    if (text('最新动态').findOne(500)) {
        let img = captureScreen();
        let point = findColor(img, '#ff6e01', { region: [img.getWidth() * 0.7, img.getHeight() * 0.6, img.getWidth() * 0.25, img.getHeight() * 0.25], threshold: 8 })
        for (let i = 0; i < num_find; i++) {
            for (let j = 0; j < 12; j++) {
                if (!cs_click(1, '#b6ff00', 0.1, 0.2, 0.8, 0.5)) break
                sleep(400)
            }
            click(point.x, point.y); sleep(1500)
            if (!text('最新动态').findOne(1000)) break
            toast('找能量/' + i)
        }
    }
}

//蚂蚁森林任务
function ant_forest_task() {
    toast_console('查看-蚂蚁森林任务')
    if (!assure_click_task('蚂蚁森林')) return
    sleep(2000); console.hide(); steal_energy(16); console.show()
    assure_back(); get_rewards()
}

//逛好店领10金币
function browse_goodshop_task(not_key_reg_str, btn_reg_str) {
    toast_console('查看-逛好店并领10金币任务')
    if (!assure_click_task('逛好店领', not_key_reg_str, btn_reg_str)) return
    for (let i = 0; i < 11 && ui.ck_earn_10coin.checked; i++) {
        let btn_x = desc('逛10秒+10').findOne(2000)
        toast_console('逛10秒+10金币/' + (i + 1))
        if (!btn_x) break
        btn_x.parent().click(); sleep(12500);
        if (ui.ck_pat_shop.checked) {
            btn_x = text('关注+10').findOne(800)
            if (btn_x) {
                btn_click(btn_x.parent()); sleep(800)
            }
        }
        back(); sleep(800);
    }
    wait(wait_sec); assure_back(); get_rewards()
}

//去天猫红包任务
function tianmao_task() {
    toast_console('查看-去天猫APP领红包任务')
    if (!assure_click_task('去天猫APP领红包')) return
    sleep(4000)
    if (text('攻略').findOne(5000)) {
        btn_click(textContains('继续逛逛').findOne(1000))
        wait(wait_sec)
    }
    assure_back(); get_rewards()
}

//掷骰子任务
function dice_task() {
    toast_console('查看-淘宝人生逛街领能量掷骰子任务')
    if (!assure_click_task('淘宝人生逛街领能量')) return
    sleep(8000)
    //去他大爷的神秘礼物
    toast_console('掷骰子任务-查看是否有神秘礼物(QTM的神秘)')
    cs_click(4, '#ffffff', 0.3, 0.1, 0.3, 0.5, true);
    //单击礼包
    toast_console('掷骰子任务-查看是否有礼包(QTM的礼包)')
    cs_click(2, '#fee998', 0.3, 0.2, 0.4, 0.4);
    //橙色收下奖励按钮按钮
    toast_console('掷骰子任务-点击5次开心收下按钮(一点都不开心- -)')
    for (let i = 0; i < 5; i++) {
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

//关闭/开启淘宝通知
function toggle_notification_permission() {
    sleep(700);
    let intent = new Intent();
    intent.setAction("android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS"); //所有应用
    app.startActivity(intent);
    let txt_search = desc('搜索查询').findOne(3000)
    if (txt_search) {
        txt_search.setText('淘宝'); sleep(500)
        btn_position_click(text('手机淘宝').findOne(1000)); sleep(500)
        btn_position_click(text('通知管理').findOne(1000)); sleep(500)
        btn_position_click(idContains('widget_frame').findOne(1000))
    }
}

//淘宝通知权限任务/仅在华为机上测试通过
function notification_permission_task(list_task_reg) {
    toast_console('查看-开启通知权限任务');
    if (!assure_click_task('开启通知权限')) return
    console.hide();
    toggle_notification_permission()
    app.launch('com.taobao.taobao'); sleep(500)
    assure_back(list_task_reg)
    toggle_notification_permission()
    app.launch('com.taobao.taobao'); sleep(500);
    console.show();
    get_rewards();
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
            swipe(x1, y1, x2, y2, 800); sleep(800)
        });
    }
    back(); sleep(800);
    //回到主页1 灰色的暂时离开
    cs_click(2, '#9d6031', 0.2, 0.2, 0.4, 0.5, true)
    //回到主页2 金色的回到主页
    cs_click(2, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(2000);
    //再挑战?
    cs_click(5, '#ffffff', 0.6, 0.15, 0.35, 0.5); sleep(800)
    //返回淘宝按钮
    back(); sleep(1000);
    cs_click(3, '#ff6e09', 0.2, 0.2, 0.4, 0.4, true);
    console.show(); get_rewards()
}

//天天红包赛
function stepnumber_task() {
    toast_console('查看-活力步数兑换红包任务')
    if (!assure_click_task('步数')) return
    if (btn_click(text('去使用').findOne(1000))) {
        swipe(device.width / 2, device.height / 5, device.width / 2, device.height / 2, 500)
    }
    btn_click(textContains('免费领取').findOne(1000)); assure_back(); get_rewards()
}

//淘金币夺宝任务,需花费100淘金币
function duobao_task() {
    toast_console('查看-100淘金币夺宝任务')
    if (!assure_click_task('淘金币抢')) return
    btn_position_click(text('立即参与').findOne(3000))
    btn_click(text('参与兑换抽奖号').findOne(3000))
    let num = 5
    while (num--) btn_click(text('-').findOne(1000))
    btn_click(text('确定兑换').findOne(1000)); sleep(200)
    btn_click(text('确认兑换').findOne(1000)); sleep(200)
    btn_click(text('我知道了').findOne(1000)); sleep(1000)
    back(); sleep(1000); back(); sleep(1000);
    cs_click(3, '#ff7d44', 0.1, 0.2, 0.5, 0.5, true); sleep(500)
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
            back(); btn_position_click(desc('继续退出').findOne(800))
            btn_click(textMatches('残忍离开|回到淘宝|立即领取').findOne(500))
            if (obj.txt.indexOf('淘宝吃货') > -1) cs_click(1, '#ff7d44', 0.2, 0.2, 0.4, 0.4, true)
        }
        get_rewards()
    }
}

//取消关注的店铺
function cancel_pat_shop() {
    app.launch('com.taobao.taobao');
    btn_click(desc('我的淘宝').findOne(5000))
    btn_position_click(text('关注店铺').findOne(1000))
    for (let i = 0; i < MAX_EPOCH; i++) {
        let list_x = className("ImageView").find()
        for (let i = 0; i < list_x.length; i++) {
            let btn_x = list_x[i]
            let h = btn_x.bounds().bottom - btn_x.bounds().top
            if (h < 10) { //hight较小的控件
                if (btn_x && btn_x.parent()) {
                    btn_x.parent().click(); sleep(500)
                    let bnt_cancel = desc('取消关注').findOne(1000)
                    if (bnt_cancel) {
                        btn_click(bnt_cancel.parent()); sleep(1000)
                    }
                }
            }
        }
    }
}

//进入到淘金币列表界面
function get_into_taojinbi_task_list(list_task_reg) {
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
            btn_x.click(); toast_console('进入到淘金币主界面..'); sleep(2000)
            for (let i = 0; i < 8; i++) {
                btn_click(text('签到领金币').findOne(1000)); btn_click(text('领取奖励').findOne(1000))
                btn_x = text('赚金币').findOne(1000)
                if (btn_x) break
            }
            if (!btn_x) {
                toast_console('无法找到[赚金币]按钮,请重新运行程序'); exit()
            }
            btn_x.click()
        }
    }
    toast_console('进入到淘金币列表界面..'); textMatches('每日来访领能量.+').findOne(6000);
}


function taojinbi_task() {
    let list_task_reg = '做任务赚金币';
    let btn_reg_str = '去完成|去施肥|去领取'
    for (let i = 0; i < MAX_ALL_TASK_EPOCH; i++) {
        toast_console("#第" + (i + 1) + "次执行全任务")
        get_into_taojinbi_task_list(list_task_reg)
        if (ui.ck_simple_task.checked) {
            do_simple_task(MAX_EPOCH, wait_sec, taojinbi_reg_str, not_taojinbi_reg_str, list_task_reg, btn_reg_str)
        }
        if (ui.ck_dice_task.checked) {
            dice_task()
        }
        if (ui.ck_baba_farm_task.checked) {
            baba_farm_task()
        }
        if (ui.ck_antforest.checked) {
            ant_forest_task()
        }
        if (ui.ck_tianmao_task.checked) {
            tianmao_task()
        }
        if (ui.ck_achievement_task.checked) {
            achievement_signin_task()
        }
        if (ui.ck_haulwool_task.checked) {
            haul_wool_task(12)
        }
        if (ui.ck_browse_goog_shop.checked) {
            browse_goodshop_task();
        }
        if (ui.ck_feedchick_task.checked) {
            feed_chick_task()
        }
        if (ui.ck_stepnumber_task.checked) {
            stepnumber_task()
        }
        if (ui.ck_doubao_task.checked) {
            duobao_task()
        }
        if (ui.ck_notification_task.checked) {
            notification_permission_task(list_task_reg)
        }
        if (ui.ck_xiaoxiaole_task.checked) {
            xiaoxiaole_task()
        }
        get_rewards()
    }
    toast_console('*****淘金任务执行完毕*****')
}

function main() {
    requestScreenCapture(false);
    console.show();
    console.log('本APP完全免费，作者:Javis486，github下载地址：https://github.com/JavisPeng/taojinbi')
    taojinbi_task();
    toast_console('###***全部任务执行完毕***###')
}


ui.layout(
    <vertical >
        <checkbox text="简单的逛逛浏览任务" id="ck_simple_task" checked='true' />
        <checkbox text="淘宝人生掷色子任务" id="ck_dice_task" checked='true' />
        <checkbox text="逛农场免费水果任务" id="ck_baba_farm_task" checked='true' />
        <checkbox text="支付宝蚂蚁森林任务" id="ck_antforest" checked='true' />
        <checkbox text="天猫程序领红包任务" id="ck_tianmao_task" checked='true' />
        <checkbox text="薅羊毛话费充值任务" id="ck_haulwool_task" checked='true' />
        <checkbox text="淘宝成就的签到任务" id="ck_achievement_task" checked='true' />
        <checkbox text="淘宝通知栏权限任务" id="ck_notification_task" checked='true' />
        <checkbox text="天天红包赛步数任务" id="ck_stepnumber_task" checked='true' />
        <checkbox text="蚂蚁庄园喂小鸡任务" id="ck_feedchick_task" checked='true' />
        <checkbox text="100淘金币夺宝任务" id="ck_doubao_task" checked='true' />
        <checkbox text="开心砖块消消乐任务" id="ck_xiaoxiaole_task" checked='true' />
        <checkbox text="逛好店浏览10秒任务" id="ck_browse_goog_shop" checked='true' />
        <horizontal>
            <checkbox text="好店额外10金币任务" id="ck_earn_10coin" checked='true' />
            <checkbox text="好店收藏10金币任务" id="ck_pat_shop" checked='true' />
        </horizontal>
        <button id="btn_run_main" text="执行选中任务" />
        <button id="btn_task_toggle" text="任务选择开关" />
        <button id="btn_zfb_antforest" text="单独执行蚂蚁森林找能量" />
        <button id="btn_cancel_attention" text="单独执行取消关注的店铺" />
        <button id="btn_exit" text="退出程序" />
    </vertical>
);

//选择项开关
ui.btn_task_toggle.click(function () {
    list_ck = get_check_box_list();
    list_ck.forEach(x => {
        x.checked = !x.checked;
    })
})

//获取单选框列表
function get_check_box_list() {
    return [ui.ck_simple_task, ui.ck_dice_task, ui.ck_baba_farm_task, ui.ck_antforest, ui.ck_tianmao_task,
    ui.ck_achievement_task, ui.ck_haulwool_task, ui.ck_browse_goog_shop, ui.ck_earn_10coin, ui.ck_pat_shop,
    ui.ck_feedchick_task, ui.ck_stepnumber_task, ui.ck_notification_task, ui.ck_doubao_task, ui.ck_xiaoxiaole_task];
}

//运行选择项
ui.btn_run_main.click(function () {
    threads.start(function () {
        main(); exit()
    });
})

ui.btn_exit.click(function () { exit() })

//直接启动支付宝蚂蚁森林偷取好友能量,需添加蚂蚁森林到首页
ui.btn_zfb_antforest.click(function () {
    threads.start(function () {
        requestScreenCapture(false);
        app.launch('com.eg.android.AlipayGphone'); sleep(1000)
        let btn_ant = textContains('蚂蚁森林').findOne(2000)
        if (!btn_ant) {
            toast('无法找到蚂蚁森林,请先添加到支付宝首页'); return
        }
        btn_position_click(btn_ant)
        steal_energy(64); exit()
    });
})

ui.btn_cancel_attention.click(function () {
    threads.start(function () {
        cancel_pat_shop(); exit()
    });
})
