import Foundation

/// Represents a field in multipart form data
enum MultipartFormField {
    /// A single file field
    case file(_ file: FormFile, fieldName: Swift.String)
    /// An array of files with the same field name
    case fileArray(_ files: [FormFile], fieldName: Swift.String)
    /// A text field with JSON-encoded value (for strings, numbers, booleans, dates, etc.)
    case field(_ value: EncodableValue, fieldName: Swift.String)

    /// Create a text field from any Encodable value
    static func field<T: Swift.Encodable>(_ value: T, fieldName: Swift.String) -> MultipartFormField
    {
        return .field(.init(value), fieldName: fieldName)
    }
}
