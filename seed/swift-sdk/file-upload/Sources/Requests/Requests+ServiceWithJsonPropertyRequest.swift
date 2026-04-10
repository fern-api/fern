import Foundation

extension Requests {
    public struct ServiceWithJsonPropertyRequest {
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

extension Requests.ServiceWithJsonPropertyRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(json, fieldName: "json")
        ]
    }
}