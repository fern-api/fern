import { getTextOfTsNode } from "@fern-typescript/commons";
import { convertPathToTemplateString } from "../endpoints/endpoint-method-body/convertPathToTemplateString";

describe("convertPathToTemplateString", () => {
    it("/posts", () => {
        const templateString = convertPathToTemplateString("/posts");
        expect(getTextOfTsNode(templateString)).toBe('"/posts"');
    });

    it("/{postId}", () => {
        const templateString = convertPathToTemplateString("/{postId}");
        expect(getTextOfTsNode(templateString)).toBe("`/${request.postId}`");
    });

    it("/a-{postId}/{anotherThing}{aThirdThing}", () => {
        const templateString = convertPathToTemplateString("/a-{postId}/{anotherThing}{aThirdThing}");
        expect(getTextOfTsNode(templateString)).toBe(
            "`/a-${request.postId}/${request.anotherThing}${request.aThirdThing}`"
        );
    });
});
