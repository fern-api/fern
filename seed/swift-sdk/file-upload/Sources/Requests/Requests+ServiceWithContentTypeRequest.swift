import Foundation

extension Requests {
    public struct ServiceWithContentTypeRequest {
        public let file: FormFile
        public let foo: String?
        public let bar: MyObject?
        public let fooBar: MyObject?

        public init(
            file: FormFile,
            foo: String? = nil,
            bar: MyObject? = nil,
            fooBar: MyObject? = nil
        ) {
            self.file = file
            self.foo = foo
            self.bar = bar
            self.fooBar = fooBar
        }
    }
}

extension Requests.ServiceWithContentTypeRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(foo, fieldName: "foo"),
            .field(bar, fieldName: "bar"),
            .field(fooBar, fieldName: "foo_bar")
        ]
    }
}