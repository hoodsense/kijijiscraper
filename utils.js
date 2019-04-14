function getPriceAsInt(price) {
  if (price.substr(0, 1) !== '$') {
    return parseInt(price, 10);
  }
  return parseInt(price.substr(1), 10);
}

function getBedrooms(bedString) {
  const numberPattern = /\d+/g;
  const nums = bedString.match(numberPattern);
  if (nums !== null && nums.length) {
    return parseInt(nums.reduce((a, b) => a + b), 10);
  }

  return null;
}

function parseDescription(description) {
  const amenities = {
    laundry: false,
    hydro: false,
    gas: false,
    parking: false,
    dishwasher: false,
  };

  if (
    description.includes('ensuite laundry')
    || description.includes('Ensuite laundry')
    || description.includes('In-suite laundry')
    || description.includes('washer')
    || description.includes('dryer')
  ) {
    amenities.laundry = true;
  }

  if (description.includes('utilities included') || description.includes('Utilities included')) {
    amenities.hydro = true;
    amenities.gas = true;
  }

  if (description.includes('dishwasher')) {
    amenities.dishwasher = true;
  }

  if (
    description.includes('parking available')
    || description.includes('Parking available')
    || description.includes('parking extra')
  ) {
    amenities.parking = true;
  }

  return amenities;
}

module.exports = {
  parseDescription,
  getBedrooms,
  getPriceAsInt,
};
