//===================用户可编辑参数===================
var MAX_EPOCH = 101 //最大执行次数
var wait_sec = 15 //任务执行默认等待的时长 考虑到网络卡顿问题 默认15秒
var do_dice_task = 1 // 1表示自动执行[淘宝人生掷色子任务]，0表示跳过不执行
var do_baba_farm_task = 1 // 1表示自动执行[芭芭农场任务]，0表示跳过不执行
var do_xiaoxiaole_task = 1 // 1表示自动执行[消消乐任务]，0表示跳过不执行
var taojinbi_reg_str = "逛|欢乐|浏览|聚划算|天猫国际|看" //任务主题关键字，若有新的浏览任务出现可在此添加
var is_earn_10coin = 1 //是否在逛好店任务中也执行领10金币任务(10s+10金币)  默认执行 1
var is_collect_shop = 0 //是否在10金币任务中关注商铺(关注商铺+10金币)  默认不执行 0
var is_show_choice = 1 //是否显示特殊截图任务的选择框(生成app时使用) 默认显示

//===================通用函数=========================
//点击控件
function btn_click(x) { if (x) x.click() }

//点击控件所在坐标
function btn_position_click(x) { if (x) click(x.bounds().centerX(), x.bounds().centerY()) }

//消息提示
function toast_console(msg) {
    console.log(msg); toast(msg);
}

// 截屏查找图片颜色并单击对应的点
function cs_click(num, rgb, xr, yr, wr, hr, flipup) {
    //threshold = threshold == undefined ? 8 : threshold
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
    if (x) {
        return x.parent().childCount()
    }
    return 0
}

//等待sec秒，有完成提示后立即返回
function wait(sec) {
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
    toast_console('等待' + wait_sec + 's返回');
    return true
}

//根据正则表达式获取任务
function get_task(reg_str, not_reg_str) {
    sleep(500); textMatches('每日来访领能量.+').findOne(2000); sleep(500);
    let list_x = textMatches('去完成|去施肥|去领取').find()
    let reg = new RegExp(reg_str)
    let not_reg = not_reg_str == undefined ? new RegExp('z') : new RegExp(not_reg_str)
    for (let i = 0; i < list_x.length; i++) {
        txt = list_x[i].parent().child(0).child(0).text() //主标题
        if (reg.test(txt) && !not_reg.test(txt)) {
            toast_console(txt)
            let obj = new Object(); obj.x = list_x[i]
            return obj
        }
    }
    return null
}

//淘金币获取奖励
function get_rewards() {
    sleep(500); btn_click(text('领取奖励').findOne(2000)); sleep(2000) //等待调整布局
}

//确保任务按钮被单击，解决单击时布局发生改变的问题
function assure_click_task(name) {
    let obj = null
    for (let i = 0; i < 3; i++) {
        obj = get_task(name)
        if (!obj) return false
        if (obj.x) break
    }
    if (!obj.x) {
        toast_console('无法找到[' + name + '任务],请确保其在未完成任务列表中'); return false
    }
    obj.x.click(); return true
}

//芭芭农场任务
function baba_farm_task() {
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
    sleep(500); back(); get_rewards()
}

//淘宝成就签到
function achievement_signin_task() {
    if (!assure_click_task('淘宝成就')) return
    btn_click(text("成就礼包").findOne(3000))
    btn_click(text("我收下了").findOne(1000))
    let btn_x = text('成就签到').findOne(2000)
    if (btn_x) {
        btn_x.parent().child(3).click()
    }
    btn_click(text("我收下了").findOne(1000))
    sleep(1000); back(); get_rewards()
}

//签到领话费充值金
function signin_phonecharge_task() {
    if (!assure_click_task('签到领话费充值金')) return
    btn_click(text('立即领取').findOne(9000))
    sleep(11000); back(); get_rewards()
}

//逛直播间任务
function live_room_task() {
    if (!assure_click_task('直播间')) return
    //退出会有恶心的提示 
    wait(wait_sec); back(); sleep(1000)
    btn_position_click(desc('继续退出').findOne(1000))
    let num = 5;
    while (textMatches('观看').findOne(1000) && num--) { back(); sleep(1000) }
    get_rewards()
}

//喂小鸡任务，可以直接返回
function feed_chick_task() {
    if (!assure_click_task('小鸡')) return
    sleep(1000); btn_click(text('取消').findOne(2000)); sleep(800); back()
    if (text('打开支付宝').findOne(1000)) back()
    get_rewards();
}

//逛好店并领10金币
function shop_10coin_task() {
    if (!assure_click_task('逛好店领')) return
    for (let i = 0; i < 10 && is_earn_10coin; i++) {
        let btn_x = desc('逛10秒+10').findOne(1000)
        toast_console('逛10秒+10金币')
        if (!btn_x) break
        btn_x.parent().click(); sleep(12500);
        if (is_collect_shop) {
            click('关注+10'); sleep(500);
        }
        back(); sleep(800);
    }
    wait(wait_sec); back(); get_rewards()
}

//去天猫红包任务
function tianmao_task() {
    if (!assure_click_task('去天猫APP领红包')) return
    sleep(4000)
    let btn_x = text('继续逛逛').findOne(8000)
    if (btn_x) {
        btn_x.parent().click(); wait(wait_sec)
    }
    for (let i = 0; i < 8; i++) {
        if (!text('今日任务').findOne(500)) back()
    }
    get_rewards()
}

//掷骰子任务
function dice_task() {
    if (!assure_click_task('淘宝人生逛街领能量')) return
    sleep(5000)
    //橙色收下奖励按钮按钮
    cs_click(3, '#ff7d44', 0.2, 0.45, 0.45, 0.2);
    //金色前进按钮
    cs_click(8, '#fff89d', 0.2, 0.5, 0.45, 0.3); sleep(3000)
    //橙色收下奖励按钮按钮
    cs_click(3, '#ff7d44', 0.15, 0.5, 0.45, 0.2); back(); sleep(1000)
    //橙色返回淘宝按钮
    cs_click(3, '#ff7d44', 0.15, 0.5, 0.45, 0.2)
    btn_click(text('立刻离开').findOne(2000)); get_rewards()
}

//消消乐任务
function xiaoxiaole_task() {
    if (!assure_click_task('消消')) return
    sleep(6000);
    console.log('消消乐,等待进入游戏界面'); console.hide()
    //开心收下奖励
    cs_click(3, '#11c6bf', 0.2, 0.6, 0.3, 0.3);
    //第一次返回没有主页按钮?
    //back(); sleep(1000); cs_click(3, '#ffffff', 0.6, 0.2, 0.3, 0.5); sleep(500); //单击关闭图标 
    back(); sleep(1000)
    //回到主页
    console.log('消消乐,回到游戏首页');
    cs_click(3, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(1500)
    //邮件领取
    if (cs_click(3, '#11c6bf', 0.4, 0.6, 0.3, 0.3)) {
        cs_click(2, '#ffffff', 0.7, 0.1, 0.3, 0.4);
    }
    //滑到屏幕下方
    for (let i = 0; i < 6; i++)swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 5, 300)
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
    back(); sleep(1000);
    //回到主页1 灰色的暂时离开
    cs_click(3, '#9d6031', 0.2, 0.2, 0.4, 0.5, true)
    //回到主页2 金色的回到主页
    cs_click(3, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(3000);
    //返回淘宝按钮
    back(); sleep(1000); cs_click(3, '#ff6e09', 0.2, 0.75, 0.45, 0.2); console.show()
    get_rewards()
}

//执行简单的浏览任务
function do_simple_task(epoch, sec, reg_str) {
    let not_reg_str = '农场|消消乐|淘宝人生逛街领能量|逛好店领|小鸡|直播间|淘宝成就' //需要特殊执行的任务
    for (let i = 0; i < MAX_EPOCH; i++) {
        let obj = get_task(reg_str, not_reg_str)
        if (!obj) {
            console.log('简单浏览任务执行完毕'); break
        }
        if (!obj.x) {
            console.log('继续执行简单浏览任务'); continue
        }
        obj.x.click()
        if (wait(sec)) {
            back(); sleep(1000);
            btn_click(textContains('残忍离开|回到淘宝|立即领取').findOne(500))
            get_rewards()
        }
    }
}

function taojinbi_task() {
    if (!text('今日任务').findOne(1500)) {
        toast_console('启动淘宝app')
        app.launch('com.taobao.taobao');
        let btn_x = null
        while (!btn_x) {
            console.log('等待进入淘宝首页(若长时间等待请手动进入淘宝首页)');
            btn_x = desc('领淘金币').findOne(1000)
        }
        btn_x.click()
        toast_console('等待进入到淘金币主界面')
        btn_click(text('签到领金币').findOne(3000))
        btn_click(text('领取奖励').findOne(1000))
        btn_x = text('赚金币').findOne(3000)
        if (!btn_x) {
            toast_console('无法找到[赚金币]按钮,请重新运行程序'); return
        }
        btn_x.click()
        toast_console('等待进入到淘金币列表界面')
    }
    textMatches('每日来访领能量.+').findOne(6000); get_rewards()
    do_simple_task(MAX_EPOCH, wait_sec, taojinbi_reg_str)
    feed_chick_task()
    shop_10coin_task()
    achievement_signin_task()
    tianmao_task()
    live_room_task()
    signin_phonecharge_task()
    if (do_baba_farm_task) baba_farm_task()
    if (do_dice_task) dice_task()
    if (do_xiaoxiaole_task) xiaoxiaole_task()
    do_simple_task(32, wait_sec, taojinbi_reg_str)
    toast_console('*****淘金任务执行完毕*****')
}

//主函数
function main() {
    requestScreenCapture(false);
    if (is_show_choice) {
        do_dice_task = 0; do_baba_farm_task = 0; do_xiaoxiaole_task = 0;
        let options = dialogs.multiChoice("(作者:Javis486)请选择需要额外执行的任务", ['淘宝人生掷色子任务', '逛农场领免费水果任务', '消消乐任务'])
        options.forEach(option => {
            switch (option) {
                case 0:
                    do_dice_task = 1; break;
                case 1:
                    do_baba_farm_task = 1; break;
                case 2:
                    do_xiaoxiaole_task = 1; break;
            }
        });
    }
    console.show();
    taojinbi_task();
}

main()
