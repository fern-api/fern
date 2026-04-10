import Foundation

extension Requests {
    public struct ServiceWithInlineTypeRequest {
        public let file: FormFile
        public let request: MyInlineType?

        public init(
            file: FormFile,
            request: MyInlineType? = nil
        ) {
            self.file = file
            self.request = request
        }
    }
}

extension Requests.ServiceWithInlineTypeRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(request, fieldName: "request")
        ]
    }
}