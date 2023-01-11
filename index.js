const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Enter a single character: ", (answer) => {
    console.log(`You entered: ${answer}`);
    rl.close();
});
