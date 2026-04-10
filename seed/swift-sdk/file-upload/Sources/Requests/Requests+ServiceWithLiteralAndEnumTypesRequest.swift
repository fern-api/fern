import Foundation

extension Requests {
    public struct ServiceWithLiteralAndEnumTypesRequest {
        public let file: FormFile
        public let modelType: ModelType?
        public let openEnum: OpenEnumType?
        public let maybeName: Nullable<String>?

        public init(
            file: FormFile,
            modelType: ModelType? = nil,
            openEnum: OpenEnumType? = nil,
            maybeName: Nullable<String>? = nil
        ) {
            self.file = file
            self.modelType = modelType
            self.openEnum = openEnum
            self.maybeName = maybeName
        }
    }
}

extension Requests.ServiceWithLiteralAndEnumTypesRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(modelType, fieldName: "model_type"),
            .field(openEnum, fieldName: "open_enum"),
            .field(maybeName, fieldName: "maybe_name")
        ]
    }
}