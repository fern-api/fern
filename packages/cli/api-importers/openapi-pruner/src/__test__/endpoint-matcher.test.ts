import { describe, expect, it } from "vitest";
import { EndpointMatcher } from "../endpoint-matcher";

describe("EndpointMatcher", () => {
    it("should match exact paths", () => {
        const matcher = new EndpointMatcher([{ path: "/users", method: "get" }]);
        expect(matcher.matches("/users", "get")).toBe(true);
        expect(matcher.matches("/users", "post")).toBe(false);
        expect(matcher.matches("/posts", "get")).toBe(false);
    });

    it("should match paths with parameters", () => {
        const matcher = new EndpointMatcher([{ path: "/users/{userId}", method: "get" }]);
        expect(matcher.matches("/users/{userId}", "get")).toBe(true);
        expect(matcher.matches("/users/{id}", "get")).toBe(true);
    });

    it("should match without method specified", () => {
        const matcher = new EndpointMatcher([{ path: "/users" }]);
        expect(matcher.matches("/users", "get")).toBe(true);
        expect(matcher.matches("/users", "post")).toBe(true);
        expect(matcher.matches("/users", "delete")).toBe(true);
    });

    it("should not match paths with different segment counts", () => {
        const matcher = new EndpointMatcher([{ path: "/users/{userId}" }]);
        expect(matcher.matches("/users", "get")).toBe(false);
        expect(matcher.matches("/users/{userId}/posts", "get")).toBe(false);
    });

    it("should match paths with multiple parameters", () => {
        const matcher = new EndpointMatcher([{ path: "/users/{userId}/posts/{postId}" }]);
        expect(matcher.matches("/users/{userId}/posts/{postId}", "get")).toBe(true);
        expect(matcher.matches("/users/{id}/posts/{pid}", "get")).toBe(true);
    });

    it("should handle leading slashes correctly", () => {
        const matcher = new EndpointMatcher([{ path: "/users" }]);
        expect(matcher.matches("/users", "get")).toBe(true);
    });

    it("should match multiple selectors", () => {
        const matcher = new EndpointMatcher([
            { path: "/users", method: "get" },
            { path: "/posts", method: "get" }
        ]);
        expect(matcher.matches("/users", "get")).toBe(true);
        expect(matcher.matches("/posts", "get")).toBe(true);
        expect(matcher.matches("/comments", "get")).toBe(false);
    });
});
