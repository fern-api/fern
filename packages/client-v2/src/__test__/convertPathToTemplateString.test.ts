import { getTextOfTsNode } from "@fern-typescript/commons";
import { convertPathToTemplateString } from "../http/endpoints/endpoint-method-body/convertPathToTemplateString";

describe("convertPathToTemplateString", () => {
    it("/posts", () => {
        const templateString = convertPathToTemplateString({ head: "/posts", parts: [] });
        expect(getTextOfTsNode(templateString)).toBe('"/posts"');
    });

    it("/{postId}", () => {
        const templateString = convertPathToTemplateString({
            head: "/",
            parts: [{ pathParameter: "postId", tail: "" }],
        });
        expect(getTextOfTsNode(templateString)).toBe("`/${request.postId}`");
    });

    it("/a-{postId}/{anotherThing}{aThirdThing}", () => {
        const templateString = convertPathToTemplateString({
            head: "/a-",
            parts: [
                { pathParameter: "postId", tail: "/" },
                { pathParameter: "anotherThing", tail: "" },
                { pathParameter: "aThirdThing", tail: "" },
            ],
        });
        expect(getTextOfTsNode(templateString)).toBe(
            "`/a-${request.postId}/${request.anotherThing}${request.aThirdThing}`"
        );
    });
});
