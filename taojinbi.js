//===================用户可编辑参数===================
var MAX_EPOCH = 101 //最大执行次数
var is_earn_10coin = true //是否在逛好店任务中也执行领10金币任务(10s+10金币)
var is_collect_shop = false //是否在10金币任务中关注商铺(关注商铺+10金币)

//===================通用函数=========================
//点击控件
function btn_click(x) { if (x) x.click() }

//点击控件所在坐标
function btn_position_click(x) { if (x) click(x.bounds().centerX(), x.bounds().centerY()) }


//消息提示
function toast_console(msg) {
    toast(msg); console.log(msg)
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
//等待sec秒，有完成提示后立即返回
function wait(sec) {
    while (sec--) {
        let a1 = textMatches('点我领取奖励|任务已完成快去领奖吧|任务完成|任务已完成|任务已经全部完成啦').findOne(10)
        let a10 = finished10s()
        let a = descMatches('任务完成|快去领奖吧').findOne(1000)
        if (a1 || a10 || a) {
            toast_console('到时立即返回')
            return true
        }
        if (text('今日任务').findOne(10) && !is_double12_task) return false
    }
    toast_console('等待18s返回');
    return true
}

//淘金币10秒任务是否完成
function finished10s() {
    let x = textContains('浏览以下商品').findOne(5)
    return x && x.parent().childCount() > 6
}

//根据正则表达式获取任务
function get_task(reg_str, not_reg_str) {
    sleep(500); textMatches('累计任务奖励|每日来访领能量.+').findOne(2000); sleep(500);
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
    if (!is_double12_task) {
        sleep(500); btn_click(text('领取奖励').findOne(2000)); sleep(500); btn_click(text('领取奖励').findOne(1000)); sleep(2000) //等待调整布局
    }
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

//双12心愿卡任务
function wishcard_task() {
    if (!assure_click_task('心愿卡')) return
    sleep(6000);
    cs_click(8, '#fff89d', 0.2, 0.8, 0.45, 0.15);
    sleep(4500); back(); sleep(2000)
    cs_click(6, '#ff7d44', 0.2, 0.5, 0.45, 0.2)
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
    wait(18); back(); sleep(1000)
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
        btn_x.parent().click(); sleep(12000);
        if (is_collect_shop) {
            click('关注+10'); sleep(800);
        }
        back(); sleep(800);
    }
    wait(18); back(); get_rewards()
}

//消消乐任务
function xiaoxiaole_task() {
    if (!assure_click_task('消消')) return
    sleep(8000);
    console.log('消消乐,等待进入游戏界面');
    //开心收下奖励
    cs_click(4, '#11c6bf', 0.2, 0.6, 0.3, 0.3);
    //第一次放回没有主页按钮
    back(); sleep(1000); cs_click(3, '#ffffff', 0.6, 0.2, 0.3, 0.5); sleep(500); //单击关闭图标 
    back(); sleep(1000)
    //回到主页
    console.log('消消乐,回到主页');
    cs_click(6, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(2500)
    //close
    cs_click(3, '#f5fefb', 0.6, 0.2, 0.3, 0.3); sleep(1000)
    //滑到屏幕下方
    for (let i = 0; i < 4; i++)swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 5, 300)
    //点击第一关 绿色圆圈
    sleep(1000); cs_click(3, '#63cbc4', 0.5, 0.3, 0.4, 0.4, true); sleep(2000)
    console.log('消消乐，点击第一关');
    //开始方块 绿色方块
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
    back(); sleep(1000); cs_click(3, '#ff6e09', 0.2, 0.75, 0.45, 0.2)
    get_rewards()
}

//去天猫红包任务
function tianmao_task() {
    if (!assure_click_task('去天猫APP领红包')) return
    sleep(4000)
    let btn_x = text('继续逛逛').findOne(8000)
    if (btn_x) {
        btn_x.parent().click(); wait(18)
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
    cs_click(8, '#fff89d', 0, 0.6, 0.45, 0.2); sleep(3000)
    //橙色收下奖励按钮按钮
    cs_click(3, '#ff7d44', 0.15, 0.5, 0.45, 0.2); back(); sleep(1000)
    //橙色返回淘宝按钮
    cs_click(3, '#ff7d44', 0.15, 0.5, 0.45, 0.2)
    btn_click(text('立刻离开').findOne(2000)); get_rewards()
}

//执行简单的浏览任务
function do_simple_task(epoch, sec, reg_str) {
    let not_reg_str = '农场|消消乐|淘宝人生逛街领能量|逛好店领|小鸡|直播间|淘宝成就' //需要特殊执行的任务
    for (let i = 0; i < MAX_EPOCH; i++) {
        let obj = get_task(reg_str, not_reg_str)
        if (!obj) {
            console.log('obj为空,无可执行的简单浏览任务'); break
        }
        if (!obj.x) {
            console.log('obj.x为空,重新执行简单浏览任务'); continue
        }
        obj.x.click()
        if (wait(sec)) {
            back(); sleep(1000);
            click('残忍离开'); click('回到淘宝');
            click('立即领取'); get_rewards()
        }
    }
}

function double12_task() {
    if (!textMatches('领欢乐币|累计任务奖励').findOne(1000)) {
        app.launch('com.taobao.taobao');
        while (!desc('我的淘宝').findOne(1000)) back();
        btn_click(desc('我的淘宝').findOne(1000));
        btn_click(desc('赢1212元红包').findOne(1500)); sleep(800)
        btn_click(textMatches('签到领取.+个奖券').findOne(2500))
        btn_click(textContains('我知道').findOne(1000))
        btn_click(text('领欢乐币').findOne(3000))
    }
    btn_click(text('领欢乐币').findOne(800))
    sleep(100); btn_click(text('去打卡').findOne(1500))
    let doublle12_reg_str = "逛双|逛淘|逛优|逛聚划算|搜一搜|浏览|来拍卖|逛双|看|逛一逛"
    do_simple_task(MAX_EPOCH, 18, doublle12_reg_str)
    baba_farm_task()
    wishcard_task()
    //xiaoxiaole_task()
    do_simple_task(32, 18, doublle12_reg_str)
    toast_console('****双12任务执行完毕****')
}

function taojinbi_task() {
    if (!text('今日任务').findOne(1500)) {
        app.launch('com.taobao.taobao');
        while (!desc('我的淘宝').findOne(1000)) back();
        sleep(800); btn_click(desc('我的淘宝').findOne(1000));
        btn_position_click(text('淘金币').findOne(1000))
        btn_click(text('签到领金币').findOne(2000))
        btn_click(text('领取奖励').findOne(1000))
        let btn_x = text('赚金币').findOne(3000)
        if (!btn_x) {
            toast_console('赚金币按钮点击失败，请重新运行淘金币任务'); return
        }
        btn_x.click()
    }
    let taojinbi_reg_str = "逛|欢乐|浏览|聚划算|天猫国际|看"
    textMatches('每日来访领能量.+').findOne(6000)
    do_simple_task(MAX_EPOCH, 18, taojinbi_reg_str)
    baba_farm_task()
    feed_chick_task()
    dice_task()
    shop_10coin_task()
    signin_phonecharge_task()
    achievement_signin_task()
    tianmao_task()
    live_room_task()
    //xiaoxiaole_task()
    do_simple_task(32, 18, taojinbi_reg_str)
    toast_console('*****淘金任务执行完毕*****')
}

var is_double12_task = false //是否为双12任务,12后会调整淘金币代码

//主函数
function main() {
    requestScreenCapture(false);
    let options = dialogs.multiChoice("请选择需要执行的任务", ['开启终端消息提示', '双12任务', '淘金币任务'])
    options.forEach(option => {
        switch (option) {
            case 0:
                console.show(); break;
            case 1:
                is_double12_task = true; double12_task(); break;
            case 2:
                is_double12_task = false; taojinbi_task(); break;
        }
    });
}

main()
