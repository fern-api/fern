import Foundation

extension Requests {
    public struct InlineTypeRequest {
        public let file: FormFile
        public let request: MyInlineType

        public init(
            file: FormFile,
            request: MyInlineType
        ) {
            self.file = file
            self.request = request
        }
    }
}

extension Requests.InlineTypeRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(request, fieldName: "request")
        ]
    }
}