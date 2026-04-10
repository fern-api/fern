import Foundation

extension Requests {
    public struct ServiceWithFormEncodingRequest {
        public let file: FormFile
        public let foo: String?
        public let bar: MyObject?

        public init(
            file: FormFile,
            foo: String? = nil,
            bar: MyObject? = nil
        ) {
            self.file = file
            self.foo = foo
            self.bar = bar
        }
    }
}

extension Requests.ServiceWithFormEncodingRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .file(file, fieldName: "file"),
            .field(foo, fieldName: "foo"),
            .field(bar, fieldName: "bar")
        ]
    }
}