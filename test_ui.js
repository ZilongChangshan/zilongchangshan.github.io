const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Catch console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('http://localhost:8080/nongchang/index.html');
    await new Promise(r => setTimeout(r, 2000));

    // Attempt to click the first plot
    await page.evaluate(() => {
        const plot = document.querySelector('.farm-card');
        if (plot) plot.click();
    });

    await new Promise(r => setTimeout(r, 500));

    // Get the HTML of the modal
    const modalHTML = await page.evaluate(() => {
        const modal = document.querySelector('#plot-modal');
        if (!modal) return 'No Modal';
        const display = window.getComputedStyle(modal).display;
        return `Modal Display: ${display}\n` + modal.outerHTML;
    });

    console.log("Modal Status after click:");
    console.log(modalHTML);

    await browser.close();
})();
