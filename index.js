/* eslint-disable no-multi-assign */
/* eslint-disable no-console */
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

const utils = require('./utils');

const url = 'https://www.kijiji.ca/b-for-rent/city-of-toronto/c30349001l1700273';
const outputFile = 'data.json';
const parsedResults = [];
const pageLimit = 10;
let pageCounter = 0;

console.log(chalk.yellow.bgBlue(`\n  Scraping of ${chalk.underline.bold(url)} initiated...\n`));

const exportResults = (results) => {
  fs.writeFile(outputFile, JSON.stringify(results, null, 4), (err) => {
    if (err) {
      console.log(err);
    }
    console.log(
      chalk.yellow.bgBlue(
        `\n ${chalk.underline.bold(
          results.length,
        )} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`,
      ),
    );
  });
};

const getWebsiteContent = async (dataurl) => {
  try {
    const response = await axios.get(dataurl);
    const $ = cheerio.load(response.data);

    $('.search-item').map(async (i, el) => {
      const pageUrl = $(el)
        .find('.info .title a')
        .attr('href');

      try {
        console.log(chalk.cyan(`  Scraping: https://www.kijiji.ca${pageUrl}`));
        const html = await axios.get(`https://www.kijiji.ca${pageUrl}`);
        const description = $('[class^=descriptionContainer] p', html.data).text();
        const metadata = {
          address: $('[class^=address]', html.data).text(),
          rent: utils.getPriceAsInt($('[class^=currentPrice] span', html.data).text()),
          scrapeDate: new Date(),
          isAirBnB: false,
          bedrooms: utils.getBedrooms(
            $('[class^=itemAttributeList] li:first-child dd', html.data).text(),
          ),
          amenities: utils.parseDescription(description),
        };
        parsedResults.push(metadata);
      } catch (error) {
        console.error('error', error);
      }
    });

    // Pagination Elements Link
    const nextPageLink = $('.pagination')
      .find('.selected')
      .next()
      .attr('href');
    console.log(chalk.cyan(`  Scraping: https://www.kijiji.ca${nextPageLink}`));
    pageCounter += 1;

    if (pageCounter === pageLimit) {
      exportResults(parsedResults);
      return false;
    }

    getWebsiteContent(`https://www.kijiji.ca${nextPageLink}`);
  } catch (error) {
    exportResults(parsedResults);
    console.error('error', error);
  }
};

getWebsiteContent(url);
