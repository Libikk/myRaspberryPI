const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const logger = require('logger').createLogger(`restart__${dayjs().format('DD-MM-YYYY')}.log`);
const defaultNavTimeout = 60000;

const restart = async (devMode = true) => {
    try {
        logger.info('start restart');
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], executablePath: 'chromium-browser' });
        const page = await browser.newPage();
        page.on('dialog', async dialog => {
            console.log(dialog.message()); 
            devMode ? dialog.dismiss() : dialog.accept();
            logger.info('execute RESTART', devMode ? 'dismiss' : 'accept');
            console.log(devMode ? 'dismiss' : 'accept')
        });
        page.setDefaultNavigationTimeout(defaultNavTimeout)
        await page.goto('http://192.168.0.1');
        await page.type('#login_username', process.env.ROUTER__LOGIN);
        await page.type('#login_password', process.env.ROUTER__PASSWORD);
        await page.keyboard.press('Enter');
        await page.click('#btnLogin');
        
        const forceLogOut = '.layui-layer-btn0';
        let isForcedLoggedOut = true;
        await page.waitForSelector(forceLogOut, { timeout: 6000 })
            .then(async () => {
                console.log('waitForSelector: ');
                await page.click(forceLogOut).catch(console.error)
            })
            .catch(() => {
                isForcedLoggedOut = false;
                console.log('The element didn\'t appear.')
            })


        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: isForcedLoggedOut ? defaultNavTimeout : 4000}).catch(console.error);
        await page.goto('http://192.168.0.1/index.html#admin_devreboot/m/4/s/6', { waitUntil: 'domcontentloaded' });

        await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });

        const rebootButton = '#reboot'
        await page.waitForSelector(rebootButton)
        await page.click(rebootButton)

        await browser.close();
        logger.info('end restart');
        logger.info('----------');
    } catch (err) {
        logger.error('error restarting', err);
        logger.info('end restart');
        logger.info('----------');
        console.log(err)
    }
}
restart();
module.exports = restart;