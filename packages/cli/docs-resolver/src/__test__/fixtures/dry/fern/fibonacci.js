function fibonacci(num) {
    let n1 = 0, n2 = 1, nextTerm;

    console.log('Fibonacci Sequence:');
    for (let i = 1; i <= num; i++) {
        console.log(n1);
        nextTerm = n1 + n2;
        n1 = n2;
        n2 = nextTerm;
    }
}

// Example: Log the first 10 terms of the Fibonacci sequence
fibonacci(10);
