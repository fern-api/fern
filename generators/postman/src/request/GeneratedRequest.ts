import { FernPostman } from "@fern-fern/postman-sdk";

export interface GeneratedRequest {
    get: () => FernPostman.PostmanRequest;
}
