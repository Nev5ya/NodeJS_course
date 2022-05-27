const { green, yellow, red } = require("colors/safe");

const isPrime = (number) => {
  if (number < 2) return false;

  for (let i = 2; i <= number / 2; i++) {
    if (number % i === 0) return false;
  }

  return true;
};

let count = 1;

function checkArgs(processVars) {
  let args = processVars.splice(2, 2);

  if (args.length < 2) throw new Error(red('Should provide at least 2 vars.'));

  args = args.filter(i => {
    i = parseInt(i);
    return !isNaN(i) && i > 0;
  });

  if (args.length < 2) throw new Error(red('Should provide only natural numbers.'));

  const [from, to] = args;

  if (from > to) throw new Error(red('The first value must be less than the second.'));

  return args;
}

const [from, to] = checkArgs(process.argv);

for (let number = from; number <= to; number++) {
  let color = green;

  if (isPrime(number)) {
    if (count % 2 === 0) {
      color = yellow;
      count ++;
    } else if (count % 3 === 0) {
      color = red;
      count = 1;
    } else {
      count ++;
    }

    console.log(color(number));
  }
}