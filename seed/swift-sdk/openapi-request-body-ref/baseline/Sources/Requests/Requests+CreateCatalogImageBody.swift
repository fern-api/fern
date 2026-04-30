import Foundation

extension Requests {
    public struct CreateCatalogImageBody {
        public let request: CreateCatalogImageRequest
        public let imageFile: FormFile

        public init(
            request: CreateCatalogImageRequest,
            imageFile: FormFile
        ) {
            self.request = request
            self.imageFile = imageFile
        }
    }
}

extension Requests.CreateCatalogImageBody: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .field(request, fieldName: "request"),
            .file(imageFile, fieldName: "image_file")
        ]
    }
}