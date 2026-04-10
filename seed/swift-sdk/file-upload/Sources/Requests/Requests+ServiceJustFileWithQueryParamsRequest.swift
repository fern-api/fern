import Foundation

extension Requests {
    public struct ServiceJustFileWithQueryParamsRequest {
        public let file: FormFile

        public init(
            file: FormFile
        ) {
            self.file = file
        }
    }
}

extension Requests.ServiceJustFileWithQueryParamsRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file")
        ]
    }
}