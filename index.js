const puppeteer = require('puppeteer')
const tmp = require('tmp')
const fs = require('fs')

const htmlFile = `file:${__dirname}/example.html`;
let count = 0;

async function runner(pdfFunction, iterations, noPDF = 10){

    const durations = []
    
    console.time(pdfFunction.name)
    for (let i = 0; i<iterations; i++){

	const before = process.hrtime()
	await pdfFunction(noPDF);
	const after = process.hrtime(before)
	
	durations.push(after)
    }
    console.timeEnd(pdfFunction.name)

    const times = durations.reduce(([accSeconds,accNanos],[seconds,nanos]) =>
				     [accSeconds + seconds, accNanos + nanos],
				   [0,0]);
    const average = [ times[0]/iterations, times[1]/iterations];
    console.log(`Average of rendering ${noPDF} pdfs with ${pdfFunction.name} ${iterations} times: ${average[1]}μ seconds ( ${Math.floor(average[1]/1000000)}ms ${average[0]}s)`)
}

async function naivePDF(pdfs) {
    for( let i = 0; i<pdfs; i++){
	
	const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
	    waitUntil: 'load'
	});

	//render pdf
	const page = await browser.newPage();
	await page.goto( htmlFile );
	const buffer = await page.pdf({format: 'A4'});
	await page.close();
	browser.close();
    }
}

async function onePdfPerPage(pdfs){

    let browser = await puppeteer.launch({
        args: ['--no-sandbox'],
	waitUntil: 'load'
    });
    
    for( let i = 0; i<pdfs; i++){
	const page = await browser.newPage();
	await page.goto( htmlFile );
	const buffer = await page.pdf({format: 'A4'});
	await page.close();
    }
    await browser.close();
    return
}

async function manyPages(pdfs){

    let browser = await puppeteer.launch({
        args: ['--no-sandbox'],
	waitUntil: 'load'
    });

    let jobs = [];
    
    for( let i = 0; i<pdfs; i++){
	let job = browser.newPage().then( async (page) => {
	    await page.goto( htmlFile );
	    const buffer = await page.pdf({format: 'A4'});
	    await page.close();  
	})
	jobs.push(job);
    }

    await Promise.all(jobs);
    await browser.close();
    return
}

async function singlePage(pdfs){
    let browser = await puppeteer.launch({
        args: ['--no-sandbox'],
	waitUntil: 'load'
    });

    const page = await browser.newPage();
    for(let i = 0; i<pdfs; i++){
	await page.goto( htmlFile );
	const buffer = await page.pdf({format: 'A4'});
    }
    
    await page.close();
    await browser.close();
}

async function twoBrowsers(pdfs){
    let pdfArray = [];
    for(let pdf = 0; pdf < pdfs; pdf++ ){
	pdfArray.push(pdf);
    }

    const half = Math.floor(pdfArray.length/2);
    const list0 = pdfArray.slice(0,half)
    const list1 = pdfArray.slice(half)
    
    let buffer0 = run(list0);
    let buffer1 = run(list1);
    
    async function run(list){
	return puppeteer.launch({
            args: ['--no-sandbox'],
	    waitUntil: 'load'
	}).then( async (browser) => {
	    console.log(`working on ${list}`) 
	    await renderPage(browser,list.length);
	    await browser.close();
	});
    }

    async function renderPage(browser,amount){
	for(let i = 0; i<amount; i++){
	    return browser.newPage()
		.then( async (page) =>{
		    await page.goto( htmlFile );
		    await page.pdf({format: 'A4'});
		    await page.close();
		})
	}
    }

    await Promise.all([buffer0,buffer1]);
}

async function oneBrowserTwoPages(pdfs){
    let pdfArray = [];
    for(let pdf = 0; pdf < pdfs; pdf++ ){
	pdfArray.push(pdf);
    }

    const half = Math.floor(pdfArray.length/2);
    const list0 = pdfArray.slice(0,half)
    const list1 = pdfArray.slice(half)

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
	waitUntil: 'load' });

    let buffer0 = run(list0);
    let buffer1 = run(list1);
    
    async function run(list){
	const page = await browser.newPage()
	console.log(`working on ${list}`) 
	await renderPage(page,list.length);
	return page.close();
    }

    async function renderPage(page,amount){
	for(let i = 0; i<amount; i++){
	    await page.goto( htmlFile );
	    await page.pdf({format: 'A4'});
	}
    }

    await Promise.all([buffer0,buffer1]).then(
	async () => {
	    await browser.close();
    })

}


const functions = [naivePDF, onePdfPerPage, singlePage, twoBrowsers, oneBrowserTwoPages, manyPages];
const numberOfPdfs = 10;
const iteractions = 3;

async function run(){
    for( let f of functions){
	console.log(`Using ${f.name} to generate ${numberOfPdfs} PDFs ${iteractions} times`)
	await runner(f, iteractions, numberOfPdfs).then()
	console.log("")
    }
}

run().then( () => console.log("End"))
