import Foundation

struct HTTP {
    enum Method: String, CaseIterable {
        case get = "GET"
        case post = "POST"
        case put = "PUT"
        case delete = "DELETE"
        case patch = "PATCH"
        case head = "HEAD"
    }

    enum ContentType: String, CaseIterable {
        case applicationJson = "application/json"
        case applicationOctetStream = "application/octet-stream"
    }

    enum RequestBody {
        case jsonEncodable(any Encodable)
        case data(Data)
    }
}
