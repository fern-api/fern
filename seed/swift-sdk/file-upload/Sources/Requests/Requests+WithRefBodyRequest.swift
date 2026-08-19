import Foundation

extension Requests {
    public struct WithRefBodyRequest {
        public let imageFile: FormFile
        public let request: MyObject

        public init(
            imageFile: FormFile,
            request: MyObject
        ) {
            self.imageFile = imageFile
            self.request = request
        }
    }
}

extension Requests.WithRefBodyRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(imageFile, fieldName: "image_file"),
            .field(request, fieldName: "request")
        ]
    }
}