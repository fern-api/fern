import Foundation

extension JSONEncoder {
    /// Helper for type-erasing Encodable values
    private struct AnyEncodable: Encodable {
        private let value: Swift.Any

        init(_ value: Swift.Any) {
            self.value = value
        }

        func encode(to encoder: Encoder) throws {
            try value.encode(to: encoder)
        }
    }

    func encode(value: EncodableValue) throws -> Foundation.Data {
        return try self.encode(AnyEncodable(value.value))
    }
}
