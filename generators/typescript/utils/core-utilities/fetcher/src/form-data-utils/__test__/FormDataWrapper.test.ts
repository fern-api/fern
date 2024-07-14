import { FormDataWrapper } from "../FormDataWrapper";

describe("FormDataWrapper", () => {
    it("should append data correctly", async () => {
        const wrapper = new FormDataWrapper();
        await wrapper.append("key", "value");
        const request = wrapper.getRequest();
        const headers = await request.getHeaders();

        expect(headers).toHaveProperty("content-type");
        expect(headers["content-type"]).toContain("multipart/form-data");
    });

    it("should return FormData from request and body", async () => {
        const wrapper = new FormDataWrapper();
        await wrapper.append("key", "value");
        const request = wrapper.getRequest();

        expect(await request.getBody()).toBeInstanceOf((await import("form-data")).default);
    });

    it("should have two payloads", async () => {
        const wrapper = new FormDataWrapper();
        await wrapper.append("key", "value");
        await wrapper.append("key2", "value2");
        const request = wrapper.getRequest();

        expect((await request.getBody())._streams.length).toBe(6);
    });
});
