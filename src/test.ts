import * as fs from 'fs'
import * as xml2js from 'xml2js'

export async function readXML(): Promise<void> {
    const parser = new xml2js.Parser()
    const datas = await fs.readFileSync('./datas/GetVDDATA.xml', { encoding: 'utf-8' })

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

    for (const info of VD_Infos) { // parse xml into VD_datas
        const device = info.VDData[0].VDDevice[0]

        if (!VD_datas[device.DeviceID]) {
            VD_datas[device.DeviceID] = {}
        }

        for (const detail of device.LaneData) {
            let DENSITY: number = 0
            let FLOW: number = 0
            let SPEED: number = 0
            if (!VD_datas[device.DeviceID][detail.LaneNO]) {
                VD_datas[device.DeviceID][detail.LaneNO] = {}
            }

            FLOW = parseInt(detail.Volume[0])
            SPEED = parseInt(detail.AvgSpeed[0])
            DENSITY = parseInt(detail.AvgOccupancy[0])

            VD_datas[device.DeviceID][detail.LaneNO]["DENSITY"] = DENSITY
            VD_datas[device.DeviceID][detail.LaneNO]["FLOW"] = FLOW
            VD_datas[device.DeviceID][detail.LaneNO]["SPEED"] = SPEED
            VD_datas[device.DeviceID][detail.LaneNO]["unixtime"] = updateTime
        }
    }

    fs.writeFile('./datas/GetVDDATA.json', JSON.stringify(VD_datas), (err) => console.log(err))
    // return VD_datas
}

readXML()