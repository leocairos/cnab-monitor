import 'dotenv/config';

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const appPort = Number(process.env.APP_PORT || 3305);
const PATH_FILES = process.env.PATH_FILES;
const directoryPath = path.resolve(__dirname, PATH_FILES);
const idsFilter = `${process.env.IDS_FILTER}`.split(';');

const readInterval = 1000 * 10 * Number(process.env.READ_FILES_INTERVAL);

let isReading = false;

const app = express();
const results = [];

function myDate(dateString: string): Date{ 
  const dateParts = dateString.split("/");
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
}

const msgLog = `Service running on port '${appPort}' (${process.env.NODE_ENV})
    Read from ${directoryPath} every ${readInterval / 1000 / 60} minutes.`;

app.get('/', (req: Request, res: Response) => {
  const resultsOrdered = [...results]
  resultsOrdered.sort(function (a, b) {
    const dateA = myDate(a.date);
    const dateB = myDate(b.date);
    if (dateA > dateB) return 1;
    if (dateA < dateB) return -1;
    return 0;
  });
  return res.json({ status: msgLog, filteredIds: idsFilter, resultsOrdered });
}
);


app.listen(appPort, () => {
  console.info(msgLog);
});

async function readFileByLine(file: string) {

  const fileStream = fs.createReadStream(file);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let date1: string, date2: string, id: string, name: string, firstName: string, value: number
  for await (const line of rl) {
    const recordType = line.substring(0, 1);
    if (recordType === '0') {
      date1 = line.substring(94, 102);
      date2 = line.substring(110, 118);
    }
    if (recordType === '1') {
      id = line.substring(121, 126).trim();
      if (idsFilter.includes(id)) {
        name = line.substring(82, 120).trim();
        firstName = name.split(" ")[0];
        value = Number(line.substring(126, 139).trim()) / 100;
        const newResult = {
          file,
          date: `${date1.substring(0, 2)}/${date1.substring(2, 4)}/${date1.substring(4, 8)}`,
          employee: id, value
        };
        const index = results.findIndex(r => JSON.stringify(r) === JSON.stringify(newResult));
        if (index < 0) {
          console.log(newResult);
          results.push(newResult);
        }
      }
    }
  }

}

async function monitorFiles() {
  if (!isReading) {
    isReading = true;

    console.info(`Read from ${directoryPath} every ${readInterval / 1000} seconds.`);
    fs.readdir(directoryPath, function (err, files) {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      files.forEach(async function (file) {
        await readFileByLine(`${directoryPath}/${file}`);
      });
    });
    isReading = false;
  }
}

setInterval(monitorFiles, readInterval);