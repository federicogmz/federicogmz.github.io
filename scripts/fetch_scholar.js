#!/usr/bin/env node
import { promises as fsp } from 'fs';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { decode } from 'html-entities';
import iconv from 'iconv-lite';

const argv = yargs(hideBin(process.argv))
    .option('id', { type: 'string', demandOption: true, describe: 'Google Scholar user ID' })
    .option('out', { type: 'string', demandOption: true, describe: 'Output JSON file path' })
    .argv;

async function fetchRange(start, end, id) {
    const publications = [];
    // fetch JSON snippet as ISO-8859-1 to preserve accents
    const resp = await fetch(
        `https://scholar.google.com/citations?user=${id}&cstart=${start}&pagesize=${end}`,
        { method: 'POST', body: 'json=1' }
    );
    const buf = await resp.arrayBuffer();
    // decode using Windows-1252 to correctly map special accented chars
    const raw = iconv.decode(Buffer.from(buf), 'win1252');
    const recordJson = JSON.parse(raw);
    const dom = parse(decode(recordJson.B));
    for (const row of dom.childNodes) {
        const href = row.querySelector('a')?.getAttribute('href');
        if (!href) continue;
        const citeId = href.split(':')[1];
        // fetch detailed page in UTF-8
        const detailResp = await fetch(
            `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${id}&citation_for_view=${id}:${citeId}`
        );
        const detailBuf = await detailResp.arrayBuffer();
        // decode detailed citation page with Windows-1252
        const detailHTML = iconv.decode(Buffer.from(detailBuf), 'win1252');
        const detailDom = parse(detailHTML);

        const table = detailDom.getElementById('gsc_oci_table');
        const titleElem = detailDom.getElementById('gsc_oci_title');
        const detailedRecord = {
            title: decode(titleElem?.text || ''),
            link: titleElem?.querySelector('a')?.getAttribute('href') || ''
        };
        table.childNodes.forEach(item => {
            const key = decode(item.childNodes[0].text.trim());
            // decode inner HTML to preserve accents/entities
            const rawValue = item.childNodes[1].innerHTML;
            const value = decode(rawValue).trim();
            switch (key) {
                case 'Authors': detailedRecord.authors = value.split(', '); break;
                case 'Publication date': detailedRecord.date = value.split('/').map(n => parseInt(n)); break;
                case 'Journal':
                case 'Conference': detailedRecord.journal = value; break;
                case 'Volume': detailedRecord.volume = value; break;
                case 'Pages': detailedRecord.pages = value; break;
                case 'Publisher': detailedRecord.publisher = value; break;
                case 'Description': detailedRecord.description = value.replace(/<[^>]+>/g, ''); break;
                case 'Total citations': detailedRecord.citations = parseInt(item.childNodes[1].querySelector('a')?.text.match(/\d+/)[0] || '0'); break;
            }
        });
        publications.push(detailedRecord);
    }
    return publications;
}

async function fetchRecord(id, outPath) {
    let all = [];
    let start = 0;
    const step = 100;
    while (true) {
        const pagePubs = await fetchRange(start, step, id);
        all = all.concat(pagePubs);
        if (pagePubs.length < step) break;
        start += step;
    }
    await fsp.mkdir(path.dirname(outPath), { recursive: true });
    await fsp.writeFile(outPath, JSON.stringify(all, null, 2));
    console.log(`Wrote ${all.length} pubs to ${outPath}`);
}

fetchRecord(argv.id, argv.out);
