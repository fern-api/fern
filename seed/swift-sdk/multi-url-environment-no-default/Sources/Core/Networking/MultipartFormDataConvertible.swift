import Foundation

/// Protocol for types that can be converted to multipart form data
protocol MultipartFormDataConvertible {
    /// The multipart fields that represent this request
    var multipartFormFields: [MultipartFormField] { get }
}

extension MultipartFormDataConvertible {
    /// Converts this request to multipart form data
    func asMultipartFormData() -> MultipartFormData {
        let multipartData = MultipartFormData()
        let jsonEncoder = Serde.jsonEncoder

        for field in multipartFormFields {
            switch field {
            case .file(let file, let fieldName):
                multipartData.appendFile(file.data, withName: fieldName, fileName: file.filename)
            case .fileArray(let files, let fieldName):
                for file in files {
                    multipartData.appendFile(
                        file.data,
                        withName: fieldName,
                        fileName: file.filename
                    )
                }
            case .field(let encodableValue, let fieldName):
                do {
                    let encodedData = try jsonEncoder.encode(value: encodableValue)
                    if let encodedString = Swift.String(data: encodedData, encoding: .utf8) {
                        multipartData.appendField(encodedString, withName: fieldName)
                    }
                } catch {
                    // Fallback - this should rarely happen with well-formed Encodable types
                    multipartData.appendField("", withName: fieldName)
                }
            }
        }

        return multipartData
    }
}
