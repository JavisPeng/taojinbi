//最大执行次数
var MAX_EPOCH = 101

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
        //console.log(point);
        if (point) {
            click(point.x, point.y); break
        }
        sleep(1000)
    }
}

//===================业务逻辑函数=========================
/**
 * 等待sec秒，有完成提示后立即返回
 * @param {*} sec 等待时长(秒)
 * @param {*} mid_back 中途是否需要back,针对淘金币直播任务
 */
function wait(sec, mid_back) {
    while (sec--) {
        let a1 = textMatches('点我领取奖励|任务已完成快去领奖吧|任务完成|任务已完成|任务已经全部完成啦').findOne(10)
        let a10 = finished10s()
        let a = descMatches('任务完成|快去领奖吧').findOne(1000)
        if (mid_back && sec == 14) back
        if (a1 || a10 || a) {
            //console.log('立即返回' + a1 + ' ' + ' ' + a10 + ' ' + a); 
            toast_console('到时立即返回')
            return
        }
    }
    toast_console('等待18s返回');
}

//淘金币10秒任务是否完成
function finished10s() {
    let x = textContains('浏览以下商品').findOne(5)
    return x && x.parent().childCount() > 6
}

//根据正则表达式获取任务
function get_task(reg_str) {
    sleep(1000); textMatches('累计任务奖励|每日来访领能量.+').findOne(3000)
    let list_x = textMatches('去完成|去施肥').find()
    let reg = new RegExp(reg_str)
    for (let i = 0; i < list_x.length; i++) {
        let btn_x = list_x[i]
        txt = btn_x.parent().child(0).child(0).text() //主标题
        if (reg.test(txt) && !/消消乐/.test(txt)) {
            toast_console(txt)
            return btn_x
        }
    }
    return null
}

//淘金币获取奖励
function get_rewards() {
    btn_click(text('领取奖励').findOne(1500)); sleep(2500) //等待调整布局
}

//执行简单的浏览任务
function do_simple_task(sec, reg_str) {
    for (let i = 0; i < MAX_EPOCH; i++) {
        let btn_todo = get_task(reg_str)
        //console.log('** ', btn_todo)
        if (!btn_todo) break
        btn_todo.click(); wait(sec); back(); sleep(1000);
        click('残忍离开'); click('回到淘宝');
        btn_click(desc('继续退出').findOne(1000)) //直播观看
        click('立即领取'); get_rewards()
    }
}

//双12心愿卡任务
function wishcard_task() {
    btn_todo = get_task('心愿卡')
    if (!btn_todo) {
        toast_console('无法找到[心愿卡任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click();
    sleep(6000);
    cs_click(8, '#fff89d', 0.2, 0.8, 0.45, 0.15);
    sleep(4500); back()
    cs_click(3, '#ff7d44', 0, 0.5, 0.45, 0.2)
}

//======================芭芭农场任务======================
function baba_farm_task() {
    btn_todo = get_task('农场')
    if (!btn_todo) {
        toast_console('无法找到[芭芭农场任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click(); sleep(8000)
    //金色获取肥料按钮
    cs_click(6, '#fed362', 0.5, 0.45, 0.45, 0.25)
    sleep(1000); btn_position_click(text('去施肥，赚更多肥料').findOne(1000))
    //金色施肥按钮
    cs_click(3, '#fff39f', 0.45, 0.6, 0.25, 0.35)
    sleep(500); back()
}


//淘宝成就签到
function achievement_signin_task() {
    let btn_todo = get_task('淘宝成就')
    if (!btn_todo) {
        toast_console('无法找到[淘宝成就签到任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click()
    btn_click(text("成就礼包").findOne(3000))
    btn_click(text("我收下了").findOne(1000))
    text('成就签到').findOne(2000).parent().child(3).click()
    btn_click(text("我收下了").findOne(1000))
    sleep(1000); back(); get_rewards()
}

//签到领话费
function signin_phonecharge_task() {
    let btn_todo = get_task('签到领话费')
    if (!btn_todo) {
        toast_console('无法找到[签到领话费任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click()
    btn_click(text('立即领取').findOne(9000))
    sleep(11000); back(); get_rewards()
}

//逛直播间任务
function live_room_task() {
    let btn_todo = get_task('直播间')
    if (!btn_todo) {
        toast_console('无法找到[逛直播间任务],请确保其在未完成任务列表中'); return
    }
    //退出会有恶心的提示
    btn_todo.click(); wait(18, true); back(); get_rewards()
}

//喂小鸡任务，可以直接返回
function feed_chick_task() {
    let btn_todo = get_task('小鸡')
    if (!btn_todo) {
        toast_console('无法找到[喂小鸡任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click()
    btn_click(text('取消').findOne(2000)); sleep(500); back()
    if (text('打开支付宝').findOne(1000)) back()
    get_rewards();
}

//逛好店并领10金币
function shop_10coin_task() {
    let btn_todo = get_task('逛好店领')
    if (!btn_todo) {
        toast_console('无法找到[逛好店并领10金币任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click()
    for (let i = 0; i < 10; i++) {
        let btn_x = desc('逛10秒+10').findOne(1000)
        if (!btn_x) break
        btn_x.parent().click()
        sleep(12000); click('关注+10'); sleep(800); back(); sleep(800);
    }
    wait(18); back(); get_rewards()
}

//======================掷骰子任务======================
function dice_task() {
    let btn_todo = get_task('淘宝人生逛街领能量')
    if (!btn_todo) {
        toast_console('无法找到[掷骰子任务],请确保其在未完成任务列表中'); return
    }
    btn_todo.click()
    sleep(6000)
    //金色前进按钮
    cs_click(6, '#fff89d', 0, 0.6, 0.45, 0.2); sleep(3000)
    //橙色收下奖励按钮按钮
    cs_click(3, '#ff7d44', 0.15, 0.55, 0.45, 0.2); back(); sleep(1000)
    //橙色返回淘宝按钮
    cs_click(3, '#ff7d44', 0, 0.5, 0.45, 0.2)
    get_rewards()
}


function double12_task() {
    app.launch('com.taobao.taobao')
    if (!textMatches('领欢乐币|累计任务奖励').findOne(500)) {
        while (!desc('我的淘宝').findOne(1000)) back();
        btn_click(desc('我的淘宝').findOne(1000));
        btn_position_click(desc('赢1212元红包').findOne(1000)); sleep(2000)
        btn_click(text('领欢乐币').findOne(3000))
    }
    btn_click(text('去打卡').findOne(1000))
    let doublle12_reg_str = "逛双|逛淘|逛优|逛聚划算|逛一逛|搜一搜|浏览|来拍卖|逛双|看"
    do_simple_task(18, doublle12_reg_str)
    baba_farm_task()
    wishcard_task()
    toast_console('****双12任务执行完毕')
}

function taojinbi_task() {
    app.launch('com.taobao.taobao')
    if (!text('今日任务').findOne(500)) {
        while (!desc('我的淘宝').findOne(1000)) back();
        sleep(800); btn_click(desc('我的淘宝').findOne(1000));
        btn_position_click(text('淘金币').findOne(1000))
        btn_click(text('签到领金币').findOne(3000))
        btn_click(text('领取奖励').findOne(1000))
        var btn_x = text('赚金币').findOne(1000)
        if (!btn_x) {
            back(); btn_position_click(text('淘金币').findOne(1000))
            btn_x = text('赚金币').findOne(3000)
            if (!btn_x) {
                toast_console('赚金币按钮点击失败，请重新运行淘金币任务'); return
            }
        }
        btn_x.click()
    }
    let taojinbi_reg_str = "逛淘|欢乐|浏览|逛高|聚划算|天猫国际|逛逛|逛健康|小说|逛优"
    textMatches('每日来访领能量.+').findOne(6000)
    do_simple_task(18, taojinbi_reg_str)
    baba_farm_task()
    feed_chick_task()
    dice_task()
    shop_10coin_task()
    achievement_signin_task()
    signin_phonecharge_task()
    toast_console('*****淘金任务执行完毕')
}

//主函数
function main() {
    requestScreenCapture();    //截图权限请求
    let options = dialogs.multiChoice("请选择需要执行的任务", ['开启终端消息提示', '双12任务', '淘金币任务'])
    options.forEach(option => {
        switch (option) {
            case 0:
                console.show(); break;
            case 1:
                double12_task(); break;
            case 2:
                taojinbi_task(); break;
        }
    });
}

main()
