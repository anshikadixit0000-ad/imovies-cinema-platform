const generateSeatLayout = (rows = ['A', 'B', 'C', 'D', 'E', 'F'], cols = 10, prices = { standard: 180, premium: 280, vip: 450 }) => {
  const seats = [];
  rows.forEach((rowLetter, rowIndex) => {
    let tier = 'standard';
    let price = prices.standard;

    if (rowIndex < 2) {
      tier = 'vip';
      price = prices.vip;
    } else if (rowIndex < 4) {
      tier = 'premium';
      price = prices.premium;
    }

    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatId: `${rowLetter}${c}`,
        row: rowLetter,
        col: c,
        tier,
        price,
        isBooked: false,
        bookedBy: null
      });
    }
  });
  return seats;
};

module.exports = { generateSeatLayout };
