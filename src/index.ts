import { download, getExchangeTime } from './features/actions'
import { gunzip, resetFolder } from './features/sysAvtion'
import { updateSQL } from './features/sql'

const CronJob = require('cron').CronJob

var last_exchangeTime = '2018-09-27T05:44:32.000Z'

const _ = new CronJob('00 */5 * * * *',
    async () => {
        try {
            await download()
            await gunzip()
            const exchangeTime = await getExchangeTime() || '0'

            if (exchangeTime > last_exchangeTime) {
                last_exchangeTime = exchangeTime
                await updateSQL()
            } else {
                const temp = await updateSQL(last_exchangeTime)
                last_exchangeTime = (typeof temp === 'string') ? temp : last_exchangeTime
            }

            await resetFolder()
        } catch (err) {
            console.log(err)
        }
    }, () => {
        // 這時結束時會執行的function
        console.log(`資料抓取結束開始解壓縮`)
    }, true, 'Asia/Taipei')
