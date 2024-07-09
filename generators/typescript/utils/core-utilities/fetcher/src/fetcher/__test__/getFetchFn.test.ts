import { RUNTIME } from "../../runtime";
import { getFetchFn } from "../getFetchFn";

describe("Test for getFetchFn", () => {
    it("should get node-fetch function", async () => {
        if (RUNTIME.type == "node") {
            expect(await getFetchFn()).toEqual((await import("node-fetch")).default as any);
        }
    });

    it("should get fetch function", async () => {
        if (RUNTIME.type == "browser") {
            const fetchFn = await getFetchFn();
            expect(typeof fetchFn).toBe("function");
            expect(fetchFn.name).toBe("fetch");
        }
    });
});
