import Foundation

extension Encoder {
    func encodeAdditionalProperties<T: Encodable>(_ additionalProperties: [Swift.String: T]) throws {
        guard !additionalProperties.isEmpty else { return }
        var container = self.container(keyedBy: StringKey.self)
        for (key, value) in additionalProperties {
            try container.encode(value, forKey: .init(key))
        }
    }
}
