import Foundation

extension Foundation.JSONEncoder {
    /// Helper for type-erasing Encodable values
    private struct AnyEncodable: Swift.Encodable {
        private let value: any Swift.Encodable

        init(_ value: any Swift.Encodable) {
            self.value = value
        }

        func encode(to encoder: Swift.Encoder) throws {
            try value.encode(to: encoder)
        }
    }

    func encode(value: EncodableValue) throws -> Foundation.Data {
        return try self.encode(AnyEncodable(value.value))
    }
}
