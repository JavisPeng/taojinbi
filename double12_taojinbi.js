//最大执行次数
var MAX_EPOCH = 64

//主题关键字匹配
var REG_STRING = "逛高比例|逛猜你喜|逛淘|逛逛大牌|逛好店领|逛聚划算|逛一逛|搜一搜|浏览|来拍卖低价捡漏|拍立淘|看|天猫国际|小鸡"

//点击控件
function btn_click(x) { if (x) x.click() }

//点击控件所在坐标
function click_position(x) { click(x.bounds().centerX(), x.bounds().centerY()) }

//等待sec秒，有完成提示后立即返回
function wait(sec) {
    sleep(1000)
    while (sec--) {
        let a1 = text('点我领取奖励').findOne(10)
        let a2 = desc('任务完成').findOne(10)
        let a3 = textContains('任务已').findOne(10)
        let a = desc('快去领奖吧').findOne(1000)
        if (a1 || a2 || a3 || a) {
            console.log('提前返回'); break
        }
    }
}

//根据正则表达式获取任务
function get_task(reg_str) {
    sleep(1500); textContains('任务').findOne(10000)
    let list_x = text('去完成').find()
    let reg = new RegExp(reg_str)
    for (let i = 0; i < list_x.length; i++) {
        txt = list_x[i].parent().child(0).child(0).text() //主标题
        if (reg.test(txt)) {
            console.log(txt);toast(txt)
            return list_x[i]
        }
    }
    return null
}

//执行简单的浏览任务
function do_simple_task(sec) {
    for (let i = 0; i < MAX_EPOCH; i++) {
        let btn_todo = get_task(REG_STRING)
        if (!btn_todo) break
        sleep(1000); btn_todo.click(); wait(sec); back(); sleep(1500)
        btn_click(textContains('领取').findOne(1000))
    }
    console.log('简单浏览任务，已经完成');
}

//主函数
function main() {
    btn_click(text('领欢乐币').findOne(500))
    do_simple_task(18)
}

main()
