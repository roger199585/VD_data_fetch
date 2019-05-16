import * as util from 'util'
const exec = util.promisify(require('child_process').exec);

export async function gunzip() {
    console.log(`開始解壓縮 時間：${new Date()}`)
    const filename: string = './datas/test.xml.gz'

    try {
        await exec(`gunzip ${filename}`)
        console.log(`解壓縮完成`)
        return
    } catch (err) {
        throw new Error(`解壓縮失敗`)
    }
}

export async function resetFolder() {
    try {
        await exec(`rm -rf ./datas/`)
        await exec(`mkdir ./datas/`)
    } catch (err) {
        console.log(err)
        throw new Error(`檔案重置失敗`)
    }
}