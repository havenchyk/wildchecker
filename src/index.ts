import puppeteer, {ElementHandle, Page, Frame} from 'puppeteer';

const username = 'username';
const pass = 'pass';
const url = 'https://www.wildberries.by/catalog/5887172/detail.aspx?size=21018005';

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		slowMo: 250,
		args: [
			'--disable-features=site-per-process',
			'--disable-notifications',
		]
	})
	const page = await browser.newPage()

	page.on('console', msg => console.log('PAGE LOG:', msg.text()));

	await page.goto('https://www.wildberries.by/')
	// await browser.defaultBrowserContext().overridePermissions('https://www.wildberries.by', ['notifications'])
	await page.waitForSelector('.offline.open.j-main-login', {visible: true})
	await page.click('.offline.open.j-main-login')

	const frame = await waitForFrame(page)

	await frame.waitForSelector('#Item_Password')
	await frame.click('#Item_Login')

	await page.keyboard.type(username)

	await frame.focus('#Item_Password')
	await page.keyboard.type(pass)

	await frame.click('#signIn')
	await Promise.all([
		page.click('.my-basket'),
		page.waitForNavigation()
	]);
	debugger

	let value
	await page.evaluate((url) => {
		debugger
		value = document.querySelector(`a[href="${url}"]`)!.closest('tr')!.querySelector('.purply span')!.textContent
	}, url)


	console.log(value)

	// await browser.close()
})()

function waitForFrame(page: Page): Promise<Frame> {
  let fulfill;
  const promise = new Promise<Frame>(res => fulfill = res);
  checkFrame();
  return promise;

  function checkFrame() {
		const frame = page.frames().find(f => f.name().includes('easyXDM'))
    if (frame)
      fulfill(frame);
    else
      page.once('frameattached', checkFrame);
  }
}
