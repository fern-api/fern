import Foundation

extension Requests {
    public struct WithJsonPropertyRequest {
        public let file: FormFile
        public let json: MyObject?

        public init(
            file: FormFile,
            json: MyObject? = nil
        ) {
            self.file = file
            self.json = json
        }
    }
}

extension Requests.WithJsonPropertyRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(json, fieldName: "json")
        ]
    }
}