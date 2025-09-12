import Foundation

extension KeyedDecodingContainer {
    /// Decodes a Nullable<T>? value, properly handling missing vs null vs value
    /// Use this for `Optional<Nullable<T>>` fields
    public func decodeNullableIfPresent<T>(_ type: T.Type, forKey key: KeyedDecodingContainer<K>.Key) throws -> Nullable<T>? where T: Decodable {
        if contains(key) {
            if try decodeNil(forKey: key) {
                return .null
            } else {
                let value = try decode(type, forKey: key)
                return .value(value)
            }
        } else {
            return nil
        }
    }
}
