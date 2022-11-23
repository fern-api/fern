import { OpenAPIV3 } from "openapi-types";

export class ServiceBuilder {
    private tag: OpenAPIV3.TagObject;

    constructor({ tag }: { tag: OpenAPIV3.TagObject }) {
        this.tag = tag;
    }
}
