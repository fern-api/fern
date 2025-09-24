import Foundation

extension Requests {
    public struct OptionalArgsRequest {
        public let imageFile: FormFile
        public let request: JSONValue?

        public init(
            imageFile: FormFile,
            request: JSONValue? = nil
        ) {
            self.imageFile = imageFile
            self.request = request
        }
    }
}

extension Requests.OptionalArgsRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(imageFile, fieldName: "image_file"),
            .field(request, fieldName: "request")
        ]
    }
}