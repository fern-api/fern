import Foundation

/// Helper class for building multipart form data requests
class MultipartFormData {
    let boundary: Swift.String
    private var bodyData: Foundation.Data

    init() {
        self.boundary = "Boundary-\(Foundation.UUID().uuidString)"
        self.bodyData = Foundation.Data()
    }

    /// Append a file field to the form data
    func appendFile(
        _ data: Foundation.Data, withName name: Swift.String, fileName: Swift.String? = nil
    ) {
        bodyData.appendUTF8String("--\(boundary)\r\n")
        var contentDisposition = "Content-Disposition: form-data; name=\"\(name)\""
        if let fileName {
            contentDisposition += "; filename=\"\(fileName)\""
        }
        contentDisposition += "\r\n"
        bodyData.appendUTF8String(contentDisposition)
        bodyData.appendUTF8String(
            "Content-Type: \(HTTP.ContentType.applicationOctetStream.rawValue)\r\n\r\n")
        bodyData.append(data)
        bodyData.appendUTF8String("\r\n")
    }

    /// Append a text field to the form data
    func appendField(_ value: Swift.String, withName name: Swift.String) {
        bodyData.appendUTF8String("--\(boundary)\r\n")
        bodyData.appendUTF8String(
            "Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n")
        bodyData.appendUTF8String(value)
        bodyData.appendUTF8String("\r\n")
    }

    /// Returns the complete multipart form data with closing boundary
    func data() -> Foundation.Data {
        var finalData = bodyData
        finalData.appendUTF8String("--\(boundary)--\r\n")
        return finalData
    }
}
