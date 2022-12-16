import { PostmanRequest } from "@fern-fern/postman-sdk/resources";

export interface GeneratedRequest {
    get: () => PostmanRequest;
}
