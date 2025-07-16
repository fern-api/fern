import { PostmanRequest } from '@fern-fern/postman-sdk/api'

export interface GeneratedRequest {
    get: () => PostmanRequest
}
