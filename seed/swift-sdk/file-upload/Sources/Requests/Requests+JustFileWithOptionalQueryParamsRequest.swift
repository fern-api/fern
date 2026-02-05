import Foundation

extension Requests {
    public struct JustFileWithOptionalQueryParamsRequest {
        public let file: FormFile

        public init(
            file: FormFile
        ) {
            self.file = file
        }
    }
}

extension Requests.JustFileWithOptionalQueryParamsRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file")
        ]
    }
}