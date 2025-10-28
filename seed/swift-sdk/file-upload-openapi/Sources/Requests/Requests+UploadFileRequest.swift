import Foundation

extension Requests {
    public struct UploadFileRequest {
        public let name: String
        /// The file to upload.
        public let file: FormFile

        public init(
            name: String,
            file: FormFile
        ) {
            self.name = name
            self.file = file
        }
    }
}

extension Requests.UploadFileRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .field(name, fieldName: "name"),
            .file(file, fieldName: "file")
        ]
    }
}