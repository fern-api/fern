import Foundation

extension KeyedEncodingContainer {
    /// Encodes a Nullable<T>? value, properly handling missing vs null vs value
    /// Use this for `Optional<Nullable<T>>` fields
    public mutating func encodeNullableIfPresent<T>(_ value: Nullable<T>?, forKey key: KeyedEncodingContainer<K>.Key) throws where T: Encodable {
        switch value {
        case nil:
            // Don't encode the key at all - field is missing
            break
        case .some(.null):
            try encodeNil(forKey: key)
        case .some(.value(let wrapped)):
            try encode(wrapped, forKey: key)
        }
    }
}
