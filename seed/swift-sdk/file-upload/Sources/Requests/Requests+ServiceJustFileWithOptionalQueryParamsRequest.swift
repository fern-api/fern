import Foundation

extension Requests {
    public struct ServiceJustFileWithOptionalQueryParamsRequest {
        public let file: FormFile

        public init(
            file: FormFile
        ) {
            self.file = file
        }
    }
}

extension Requests.ServiceJustFileWithOptionalQueryParamsRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file")
        ]
    }
}