var fs = require('fs');
var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc')
var isBetween = require('dayjs/plugin/isBetween')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
dayjs.extend(isBetween)
dayjs.extend(utc)
dayjs.extend(timezone)

function readFile(fn): string[] {
    return fs.readFileSync(fn, 'utf8').split('\n').map(l => l.trim()).filter(l => !!l);
}

function parseUSDfile(usdToAudFile: string): Map<string, string> {
    const r: Map<string, string> = new Map();
    var lines: string[] = readFile(usdToAudFile);
    lines.forEach(l => {
        let [day, price] = l.split('\t').slice(0,2);
        r.set(day.trim(), Number(price).toFixed(2));
    });
    return r;
}

interface YHJsonFormat {
    id: string;
    ticker: string;
    version: string;
    amount: string;
    createdAt: string;
    status: string;
    fee: string;
    type: string;
    transactionId: string;
    txHash: string;
}

function writeOut(path:string, lines: string[]) {    
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Written to ' + path);
}


function yhJsonToSheetsCsv(audHistory:string, inYHFile: string, outYHFile: string) {
    // In: YH.json, AUD on date file.
    // Out: Interest, Date Acquired, Currency (e.g. USDC), Amount, FY, USD/AUD at Purchase, AUD (Cost Base for CGT), Sell Date, Sell Price, Brokerage (For Sale), USD/AUD at Sale, Brokerage (AUD), Discount Eligible, CGT

    const prices = parseUSDfile(audHistory);
    const rawData = fs.readFileSync(inYHFile);
    const parsedYH: YHJsonFormat[] = JSON.parse(rawData).rows;
    const headerRow: string = "Interest, Date Acquired, Currency (e.g. USDC), Amount, FY, USD/AUD at Purchase, AUD (Cost Base for CGT), Sell Date, Sell Price, Brokerage (For Sale), USD/AUD at Sale, Brokerage (AUD), Discount Eligible, CGT";
    const out = parsedYH
        .filter(x => x.type === 'SAVING_EARN')
        .map(inRow => {
            const outRow = [];
            const date = dayjs(new Date(inRow.createdAt)).tz('Australia/Sydney');
            const dateInAudFile = date.format('MMM DD, YYYY');
            outRow.push('YouHodler');
            outRow.push(date.format('DD/MM/YYYY')); 
            outRow.push(inRow.ticker);
            outRow.push(inRow.amount);
            outRow.push(date.isBetween('2020-07-01','2021-07-01', null, '[)') ? '21':'22');
            const price = prices.get(dateInAudFile);
            if (!price) {
                console.log('Skipped:' + dateInAudFile + ' Could Not Find AUD/USD Price');
                return undefined;
            } 
            outRow.push(price);
            outRow.push(Number(price) * Number(inRow.amount));
            for (let i = 0; i < 7; i++)  {
                outRow.push(""); // push empty rows
            }
            return outRow;
        })
        .filter(x => !!x)
        .map(arr => arr.join(","))
        .reverse();
    writeOut(outYHFile, [headerRow, ...out]);
}

yhJsonToSheetsCsv('example/usd-aud.txt', 'example/exampleYH.json', 'output/exampleYH.out.csv')