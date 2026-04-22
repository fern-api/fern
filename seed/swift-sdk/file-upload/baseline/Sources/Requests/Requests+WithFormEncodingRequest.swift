import Foundation

extension Requests {
    public struct WithFormEncodingRequest {
        public let file: FormFile
        public let foo: String
        public let bar: MyObject

        public init(
            file: FormFile,
            foo: String,
            bar: MyObject
        ) {
            self.file = file
            self.foo = foo
            self.bar = bar
        }
    }
}

extension Requests.WithFormEncodingRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(foo, fieldName: "foo"),
            .field(bar, fieldName: "bar")
        ]
    }
}