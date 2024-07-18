describe("Fetcher Tests", () => {
    it("fail", () => {
        //@ts-expect-error
        console.log(window.Blob);
        expect(true).toBe(false);
    });
});
