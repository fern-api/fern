import Foundation

enum HTTP {
    enum Method: Swift.String, Swift.CaseIterable {
        case get = "GET"
        case post = "POST"
        case put = "PUT"
        case delete = "DELETE"
        case patch = "PATCH"
        case head = "HEAD"
    }

    enum ContentType: Swift.String, Swift.CaseIterable {
        case applicationJson = "application/json"
        case applicationOctetStream = "application/octet-stream"
        case multipartFormData = "multipart/form-data"
    }

    enum RequestBody {
        case jsonEncodable(any Swift.Encodable)
        case data(Foundation.Data)
        case multipartFormData(MultipartFormData)
    }
}
