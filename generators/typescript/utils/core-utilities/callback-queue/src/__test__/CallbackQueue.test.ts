import { CallbackQueue } from "../CallbackQueue";

describe("CallbackQueue", () => {
    it("correctly queues functions", async () => {
        const numbers: number[] = [];

        const queue = new CallbackQueue();

        const waitOneSecondThenPushNumber = queue.wrap(async (number: number) => {
            await delay(1_000);
            numbers.push(number);
        });

        const immediatelyPush0 = queue.wrap(() => {
            numbers.push(0);
        });

        waitOneSecondThenPushNumber(1);
        waitOneSecondThenPushNumber(2);
        immediatelyPush0();
        waitOneSecondThenPushNumber(3);

        await queue.toPromise();

        expect(numbers).toEqual([1, 2, 0, 3]);
    }, 10_000);
});

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
