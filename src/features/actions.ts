import * as fetch from 'node-fetch'
import * as fs from 'fs'
import * as xml2js from 'xml2js'
import * as util from 'util'
const exec = util.promisify(require('child_process').exec);

// download .gz file from `https://tcgbusfs.blob.core.windows.net/blobtisv/GetVDDATA.xml.gz` \
// the .gz file contain the latest VD data from Taipei open data platform 
export async function download() {
    console.log(` 開始下載 `)
    let res = await fetch(`https://tcgbusfs.blob.core.windows.net/blobtisv/GetVDDATA.xml.gz`)

    await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream('./datas/test.xml.gz')
        res.body.pipe(fileStream)

        res.body.on("error", (err) => {
            reject(err)
        })
        fileStream.on("finish", async () => {
            console.log(`下載結束`)
            resolve();
        })
    })
}

export async function getExchangeTime(): Promise<string> {
    const parser = new xml2js.Parser()

    const datas = await fs.readFileSync('./datas/test.xml', { encoding: 'utf-8' })
    const result = await new Promise<any>((resolve, reject) =>
        parser.parseString(datas, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        }))

    return result.VDInfoSet.ExchangeTime[0].replace(/\//g, '-')
}

export async function readXML(): Promise<Object> {
    const parser = new xml2js.Parser()
    const datas = await fs.readFileSync('./datas/test.xml', { encoding: 'utf-8' })

    const result = await new Promise<any>((resolve, reject) =>
        parser.parseString(datas, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        }))

    let VD_datas = {}
    console.log(result.VDInfoSet.ExchangeTime[0]) // 上次更新時間

    const time: string = result.VDInfoSet.ExchangeTime[0].replace(/\//g, '-')
    const _updateTime: Date = new Date(time)
    const updateTime: number = _updateTime.getTime() / 1000

    const VD_Infos = result.VDInfoSet.VDInfo // 資訊內容

    if (VD_Infos === undefined) return {}

    for (const info in VD_Infos) { // parse xml into VD_datas
        const device = VD_Infos[info].VDData[0].VDDevice[0]

        if (!VD_datas[device.DeviceID]) {
            VD_datas[device.DeviceID] = {}
        }

        for (const detail of device.LaneData) {
            let DENSITY: number = 0
            let FLOW: number = 0
            let SPEED: number = 0
            if (!VD_datas[device.DeviceID][detail.LaneNO]) {
                VD_datas[device.DeviceID][detail.LaneNO] = []
            }

            FLOW = parseInt(detail.Volume[0])
            SPEED = parseInt(detail.AvgSpeed[0])
            DENSITY = parseInt(detail.AvgOccupancy[0])

            VD_datas[device.DeviceID][detail.LaneNO].push([FLOW, SPEED, DENSITY, updateTime])
        }
    }

    return VD_datas
}