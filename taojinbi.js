
//===================用户可编辑参数===================
var MAX_EPOCH = 101 //最大执行次数
var is_earn_10coin = true //是否在逛好店任务中也执行领10金币任务(10s+10金币)
var is_collect_shop = true //是否在10金币任务中关注商铺(关注商铺+10金币)

//===================通用函数=========================
//点击控件
function btn_click(x) { if (x) x.click() }

//点击控件所在坐标
function btn_position_click(x) { if (x) click(x.bounds().centerX(), x.bounds().centerY()) }


//消息提示
function toast_console(msg) {
    toast(msg); console.log(msg)
}

/**
 * 截屏查找图片颜色并单击对应的点
 * @param {*} num 尝试次数
 * @param {*} rgb RGB颜色值 如'#fed362'
 * @param {*} xr x坐标相对图片宽的比例
 * @param {*} yr y坐标相对图片高的比例
 * @param {*} wr 区域宽相对图片宽的比例
 * @param {*} hr 区域高相对图片高的比例
 */
function cs_click(num, rgb, xr, yr, wr, hr) {
    while (num--) {
        let img = captureScreen()
        let point = findColor(img, rgb, { region: [img.getWidth() * xr, img.getHeight() * yr, img.getWidth() * wr, img.getHeight() * hr], threshold: 8 })
        if (point) {
            //console.log(point);
            click(point.x, point.y); break
        }
        sleep(1000)
    }
}

//===================业务逻辑函数=========================
/**
 * 等待sec秒，有完成提示后立即返回
 * @param {*} sec 等待时长(秒)
 */
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
    sleep(1000); textMatches('累计任务奖励|每日来访领能量.+').findOne(3000)
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
        sleep(500); btn_click(text('领取奖励').findOne(2000)); sleep(1500) //等待调整布局
    }
}

//执行简单的浏览任务
function do_simple_task(epoch, sec, reg_str) {
    let not_reg_str = '农场|消消乐|淘宝人生逛街领能量|逛好店领|小鸡' //需要特殊执行的任务
    for (let i = 0; i < MAX_EPOCH; i++) {
        let obj = get_task(reg_str, not_reg_str)
        if (!obj) {
            console.log('obj为空,无可执行任务'); break
        }
        if (!obj.x) {
            console.log('obj.x为空,重新执行'); continue
        }
        obj.x.click()
        if (wait(sec)) {
            back(); sleep(1000);
            click('残忍离开'); click('回到淘宝');
            click('立即领取'); get_rewards()
        }
    }
}

/**
 * 确保任务按钮被单击，解决单击时布局发生改变的问题
 * @param {*} name  任务主题关键字
 */
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
    sleep(8000)
    //金色获取肥料按钮
    cs_click(6, '#fed362', 0.5, 0.45, 0.45, 0.25)
    sleep(1000); btn_position_click(text('去施肥，赚更多肥料').findOne(1000));sleep(500)
    let btn_col = text('TB1ZbskIEH1gK0jSZSyXXXtlpXa-108-120.png_560x370Q50s50.jpg_').findOne(1000)
    if (btn_col) {
        btn_col.click(); sleep(1000)
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
    text('成就签到').findOne(2000).parent().child(3).click()
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
    btn_todo.x.click(); wait(18); back(); sleep(800)
    let num = 5;
    while (textMatches('观看').findOne(1000) && num--) { back(); sleep(1000) }
    get_rewards()
}

//喂小鸡任务，可以直接返回
function feed_chick_task() {
    if (!assure_click_task('小鸡')) return
    btn_click(text('取消').findOne(2000)); sleep(500); back()
    if (text('打开支付宝').findOne(1000)) back()
    get_rewards();
}

//逛好店并领10金币
function shop_10coin_task() {
    if (!assure_click_task('逛好店领')) return
    for (let i = 0; i < 10 && is_earn_10coin; i++) {
        let btn_x = desc('逛10秒+10').findOne(1000)
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
    sleep(10000)
    //开心收下奖励
    cs_click(2, '#11c6bf', 0.2, 0.6, 0.3, 0.3);
    //返回
    ////cs_click(3, '#8d503b', 0, 0, 0.2, 0.2);//点击左上角放回
    sleep(2000); back(); sleep(1500)
    //回到主页
    cs_click(3, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(2500)
    //close
    cs_click(3, '#f5fefb', 0.6, 0.2, 0.3, 0.3); sleep(1000)
    //滑到屏幕下方
    for (let i = 0; i < 6; i++)swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 5, 200)
    //点击第一关
    sleep(1000); cs_click(3, '#fddc37', 0.2, 0.5, 0.5, 0.2); sleep(3000)
    //开始爱心
    cs_click(3, '#fb735b', 0.4, 0.5, 0.2, 0.3); sleep(5000)
    swipe(0.29 * device.width, 0.48 * device.height, 0.29 * device.width, 0.53 * device.height, 800); sleep(800)
    swipe(0.29 * device.width, 0.67 * device.height, 0.29 * device.width, 0.63 * device.height, 800); sleep(800)
    swipe(0.50 * device.width, 0.53 * device.height, 0.61 * device.width, 0.53 * device.height, 800); sleep(800)
    //返回2次 双12任务导致?
    back(); sleep(1000)
    cs_click(2, '#ffffff', 0.6, 0.2, 0.3, 0.2)
    sleep(500); back(); sleep(1000)
    //回到主页
    cs_click(6, '#ffbd29', 0.2, 0.5, 0.45, 0.45); sleep(3000);
    //返回淘宝按钮
    back(); sleep(1000); cs_click(3, '#ff6e09', 0.2, 0.75, 0.45, 0.2)
    get_rewards()
}

//去天猫红包任务
function tianmao_task() {
    if (!assure_click_task('去天猫APP领红包')) return
    sleep(6000)
    let btn_x = text('继续逛逛').findOne(8000)
    if (btn_x) btn_x.parent().click()
    wait(18)
    for (let i = 0; i < 8; i++) {
        if (!text('今日任务').findOne(500)) back()
    }
    get_rewards()
}

//======================掷骰子任务======================
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
    get_rewards()
}


function double12_task() {
    if (!textMatches('领欢乐币|累计任务奖励').findOne(1000)) {
        app.launch('com.taobao.taobao');
        while (!desc('我的淘宝').findOne(1000)) back();
        btn_click(desc('我的淘宝').findOne(1000));
        btn_click(desc('赢1212元红包').findOne(1500))
        btn_click(textContains('签到领取').findOne(2000))
        btn_click(textContains('我知道').findOne(1000))
        btn_click(text('领欢乐币').findOne(3000))
    }
    btn_click(text('领欢乐币').findOne(800))
    btn_click(text('去打卡').findOne(1500))
    let doublle12_reg_str = "逛双|逛淘|逛优|逛聚划算|逛一逛|搜一搜|浏览|来拍卖|逛双|看"
    do_simple_task(MAX_EPOCH, 18, doublle12_reg_str)
    baba_farm_task()
    wishcard_task()
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
        var btn_x = text('赚金币').findOne(2000)
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
    achievement_signin_task()
    signin_phonecharge_task()
    tianmao_task()
    toast_console('*****淘金任务执行完毕*****')
}

var is_double12_task = false //是否为双12任务,12后需调整淘金币代码

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
