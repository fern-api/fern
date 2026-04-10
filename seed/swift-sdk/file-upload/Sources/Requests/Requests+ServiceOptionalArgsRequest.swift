import Foundation

extension Requests {
    public struct ServiceOptionalArgsRequest {
        public let imageFile: FormFile
        public let request: Nullable<JSONValue>?

        public init(
            imageFile: FormFile,
            request: Nullable<JSONValue>? = nil
        ) {
            self.imageFile = imageFile
            self.request = request
        }
    }
}

extension Requests.ServiceOptionalArgsRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(imageFile, fieldName: "image_file"),
            .field(request, fieldName: "request")
        ]
    }
}