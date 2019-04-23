## Results
The function _onePdfPerPage_ is the fastest one with an average of 230ms, even though it is processing each HTML file sequentially.


The second best is _twoBrowsers_ with an average of 371ms. Note that this has a similar approach to _onePdfPerPage_ in parallel.

### System
My laptop, ThinkPad x230, Core I5, 6GB of RAM. 
Many other things running at the same time.
	
### Output

	Using naivePDF to generate 10 PDFs 3 times
	naivePDF: 8588.192ms
	Average of rendering 10 pdfs with naivePDF 3 times: 862595312μ seconds ( 862ms 2s)

	Using onePdfPerPage to generate 10 PDFs 3 times
	onePdfPerPage: 3691.680ms
	Average of rendering 10 pdfs with onePdfPerPage 3 times: 230534631.33333334μ seconds ( 230ms 1s)
  
	Using singlePage to generate 10 PDFs 3 times
	singlePage: 1541.935ms
	Average of rendering 10 pdfs with singlePage 3 times: 513966344.6666667μ seconds ( 513ms 0s)
  
	Using twoBrowsers to generate 10 PDFs 3 times
	working on 5,6,7,8,9
	working on 0,1,2,3,4
	working on 0,1,2,3,4
	working on 5,6,7,8,9
	working on 0,1,2,3,4
	working on 5,6,7,8,9
	twoBrowsers: 1124.634ms
	Average of rendering 10 pdfs with twoBrowsers 3 times: 374855282.3333333μ seconds ( 374ms 0s)
  
	Using oneBrowserTwoPages to generate 10 PDFs 3 times
	working on 5,6,7,8,9
	working on 0,1,2,3,4
	working on 0,1,2,3,4
	working on 5,6,7,8,9
	working on 0,1,2,3,4
	working on 5,6,7,8,9
	oneBrowserTwoPages: 1470.782ms
	Average of rendering 10 pdfs with oneBrowserTwoPages 3 times: 490247475.6666667μ seconds ( 490ms 0s)
  
	Using manyPages to generate 10 PDFs 3 times
	(node:688) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 Symbol(Connection.Events.Disconnected) listeners added. Use emitter.setMaxListeners() to increase limit
	(node:688) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 Symbol(Connection.Events.Disconnected) listeners added. Use emitter.setMaxListeners() to increase limit
	(node:688) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 Symbol(Connection.Events.Disconnected) listeners added. Use emitter.setMaxListeners() to increase limit
	manyPages: 2519.344ms
	Average of rendering 10 pdfs with manyPages 3 times: 839769635μ seconds ( 839ms 0s)

	End
  
## Benchmark 
There are a few ways to render multiple HTML files into PDF when using puppeteer. In this small research, I are considered 5 different ways to render a batch of PDF files.

## Methods
### naivePDF
This method creates one puppeteer instance, create one page, render one HTML file into PDF and closes puppeteer before starting the next job.

### onePdfPerPage
Open one puppeteer instance, create one page, render and destroy the page. Next job simply calls a new page.
	After all files are rendered, close puppeteer.
	
### singlePage
Open one puppeteer instance, create one page, render and instead of destroying the page, instruct it to open the next HTML file to render.
	
### twoBrowsers
Opens up two puppeteer instances, each processing half of the batch using _onePdfPerPage_ strategy

### oneBrowserTwoPages
Similar to _singlePage_ but there are only two pages ever created that each process half of the batch.
	
### manyPages
For each job in the batch, open a new page and render a pdf. After all is done, close puppeteer.

## Tuning the benchmark
There are three variables that can alter the benchmark's behavior:

* numberOfPds, the batch size of PDF to be rendered.
* interactions, the number of times to run each rendering method.
* functions, the methods that are executed and compared.

## Running it yourself

You know the drill with nodejs things...

	$> npm install
	$> node index.js
