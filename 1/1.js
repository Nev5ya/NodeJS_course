const { green, yellow, red } = require("colors/safe");

function checkArgs(processVars) {
  let args = processVars.splice(2, 2);

  if (args.length < 2) throw new Error(red('Should provide at least 2 vars.'));

  args = args.filter(i => {
    i = parseInt(i);
    return !isNaN(i) && i > 0;
  }).map(i => Number(i));

  if (args.length < 2) throw new Error(red('Should provide only natural numbers.'));

  const [from, to] = args;

  if (from > to) throw new Error(red('The first value must be less than the second.'));

  return args;
}

const [from, to] = checkArgs(process.argv);

function getColor(n) {
  switch (n % 3) {
    case 0:
      return green;
    case 1:
      return yellow;
    case 2:
      return red;
  }
}

let primeCount = 0;

const isPrime = (number) => {
  if (number < 2) return false;

  for (let i = 2; i <= number / 2; i++) {
    if (number % i === 0) return false;
  }

  return true;
};

for (let i = from; i <= to; i++) {
  if (isPrime(i)) {
    const color = getColor(primeCount);
    primeCount++;
    console.log(color(i));
  }
}

if (!primeCount) throw new Error(red('There are no prime numbers.'));