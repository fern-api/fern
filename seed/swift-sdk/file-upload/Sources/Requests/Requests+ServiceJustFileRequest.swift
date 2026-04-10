import Foundation

extension Requests {
    public struct ServiceJustFileRequest {
        public let file: FormFile

        public init(
            file: FormFile
        ) {
            self.file = file
        }
    }
}

extension Requests.ServiceJustFileRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file")
        ]
    }
}