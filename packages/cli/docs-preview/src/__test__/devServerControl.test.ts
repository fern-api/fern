import { describe, expect, it } from "vitest";

import { getControlRequestRejection, isDocsDevServerInfo } from "../astro/devServerControl.js";

const allowed = {
    remoteAddress: "127.0.0.1",
    host: "localhost:3000",
    origin: undefined,
    controlHeader: "1",
    serverPort: 3000
};

describe("getControlRequestRejection", () => {
    it("accepts a local request with the control header", () => {
        expect(getControlRequestRejection(allowed)).toBeUndefined();
    });

    it.each(["127.0.0.1", "::1", "::ffff:127.0.0.1"])("accepts the loopback address %s", (remoteAddress) => {
        expect(getControlRequestRejection({ ...allowed, remoteAddress })).toBeUndefined();
    });

    it.each([
        "localhost",
        "localhost:3000",
        "127.0.0.1:3000",
        "[::1]:3000",
        "LOCALHOST:3000"
    ])("accepts the Host %s", (host) => {
        expect(getControlRequestRejection({ ...allowed, host })).toBeUndefined();
    });

    it("accepts a same-server Origin", () => {
        expect(getControlRequestRejection({ ...allowed, origin: "http://localhost:3000" })).toBeUndefined();
        expect(getControlRequestRejection({ ...allowed, origin: "http://127.0.0.1:3000" })).toBeUndefined();
    });

    it.each([
        "192.168.1.20",
        "10.0.0.5",
        "::ffff:192.168.1.20",
        undefined
    ])("rejects requests from %s", (remoteAddress) => {
        expect(getControlRequestRejection({ ...allowed, remoteAddress })).toMatch(/this machine/);
    });

    it.each([undefined, "0", "true", ["1", "1"]])("rejects the control header %s", (controlHeader) => {
        expect(getControlRequestRejection({ ...allowed, controlHeader })).toMatch(/x-fern-docs-dev/);
    });

    it.each([
        undefined,
        "evil.example.com",
        "evil.example.com:3000",
        "localhost.evil.com:3000",
        "0.0.0.0:3000"
    ])("rejects the Host %s", (host) => {
        expect(getControlRequestRejection({ ...allowed, host })).toMatch(/Host/);
    });

    it.each([
        "https://evil.example.com",
        "http://localhost:4000",
        "https://localhost:3000",
        "null",
        "not a url"
    ])("rejects the Origin %s", (origin) => {
        expect(getControlRequestRejection({ ...allowed, origin })).toMatch(/cross-origin/);
    });
});

describe("isDocsDevServerInfo", () => {
    const info = {
        fernDocsDev: true,
        pid: 123,
        port: 3000,
        backendPort: 3001,
        url: "http://localhost:3000",
        fernDirectory: "/repo/fern"
    };

    it("accepts the dev-server payload", () => {
        expect(isDocsDevServerInfo(info)).toBe(true);
    });

    it.each([
        undefined,
        null,
        "fern",
        { ...info, fernDocsDev: false },
        { ...info, pid: "123" },
        { ...info, url: 1 }
    ])("rejects %s", (value) => {
        expect(isDocsDevServerInfo(value)).toBe(false);
    });
});
