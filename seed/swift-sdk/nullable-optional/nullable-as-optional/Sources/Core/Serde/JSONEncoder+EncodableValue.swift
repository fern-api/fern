import Foundation

extension JSONEncoder {
    /// Helper for type-erasing Encodable values
    private struct AnyEncodable: Encodable {
        private let value: any Encodable

        init(_ value: any Encodable) {
            self.value = value
        }

        func encode(to encoder: Encoder) throws {
            try value.encode(to: encoder)
        }
    }

    func encode(value: EncodableValue) throws -> Data {
        return try self.encode(AnyEncodable(value.value))
    }
}
