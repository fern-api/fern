import { Fetcher, fetcherImpl } from "../../../src/core/fetcher/Fetcher";

describe("Test fetcherImpl", () => {
    let mockCreateUrl: jest.Mock;
    let mockGetBody: jest.Mock;
    let mockGetFetchFn: jest.Mock;
    let mockRequestWithRetries: jest.Mock;
    let mockGetResponseBody: jest.Mock;

    beforeEach(() => {
        mockCreateUrl = jest.fn();
        mockGetBody = jest.fn();
        mockGetFetchFn = jest.fn();
        mockRequestWithRetries = jest.fn();
        mockGetResponseBody = jest.fn();

        jest.mock("../../../src/core/fetcher/Fetcher", () => ({
            createUrl: mockCreateUrl,
            getBody: mockGetBody,
            getFetchFn: mockGetFetchFn,
            requestWithRetries: mockRequestWithRetries,
            getResponseBody: mockGetResponseBody,
        }));
    });

    it("should handle successful request", async () => {
        const mockArgs: Fetcher.Args = {
            url: "https://httpbin.org/post",
            method: "POST",
            headers: { "X-Test": "x-test-header" },
            body: { data: "test" },
            contentType: "application/json",
            requestType: "json",
        };

        mockCreateUrl.mockReturnValue("https://test.com");
        mockGetBody.mockResolvedValue(JSON.stringify({ data: "test" }));
        mockGetFetchFn.mockResolvedValue(() => Promise.resolve());
        mockRequestWithRetries.mockResolvedValue({ status: 200 });
        mockGetResponseBody.mockResolvedValue({ result: "success" });

        const result = await fetcherImpl(mockArgs);
        expect(result.ok).toBe(true);
        // @ts-expect-error
        expect(result.body.json).toEqual({ data: "test" });
    });
});
