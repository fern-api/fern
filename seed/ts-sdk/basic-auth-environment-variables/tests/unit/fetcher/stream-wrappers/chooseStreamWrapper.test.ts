import { RUNTIME } from "../../../../src/core/runtime";
import { NodeUniversalStreamWrapper } from "../../../../src/core/fetcher/stream-wrappers/NodeUniversalStreamWrapper";
import { UndiciStreamWrapper } from "../../../../src/core/fetcher/stream-wrappers/UndiciStreamWrapper";
import { chooseStreamWrapper } from "../../../../src/core/fetcher/stream-wrappers/chooseStreamWrapper";

describe("chooseStreamWrapper", () => {
    beforeEach(() => {
        RUNTIME.type = "unknown";
        RUNTIME.parsedVersion = 0;
    });

    it('should return a NodeUniversalStreamWrapper when RUNTIME.type is "node" and RUNTIME.parsedVersion is not null and RUNTIME.parsedVersion is greater than or equal to 18', async () => {
        const expected = new NodeUniversalStreamWrapper(new ReadableStream());
        RUNTIME.type = "node";
        RUNTIME.parsedVersion = 18;

        const result = await chooseStreamWrapper(new ReadableStream());

        expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    });

    it('should return a Undici when RUNTIME.type is not "node"', async () => {
        const expected = new UndiciStreamWrapper(new ReadableStream());
        RUNTIME.type = "browser";

        const result = await chooseStreamWrapper(new ReadableStream());

        expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });
});
