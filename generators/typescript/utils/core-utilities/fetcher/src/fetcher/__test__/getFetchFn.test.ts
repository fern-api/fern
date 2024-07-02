import { RUNTIME } from "../../runtime";
import { getFetchFn } from "../getFetchFn";

RUNTIME;
export const setNode = () => {
    (global as any).RUNTIME = {
        type: "node",
        version: "v20.0.0"
    };
};
export const setBrowser = () => {
    (global as any).RUNTIME = {
        type: "browser",
        version: "1.0.0"
    };
};

describe("Test for getFetchFn", () => {
    it("should get node-fetch function", async () => {
        setNode();
        expect(await getFetchFn()).toEqual((await import("node-fetch")).default as any);
    });

    it("should get fetch function", async () => {
        setBrowser();
        const fetchFn = await getFetchFn();
        expect(typeof fetchFn).toBe("function");
        expect(fetchFn.name).toBe("fetch");
    });
});
