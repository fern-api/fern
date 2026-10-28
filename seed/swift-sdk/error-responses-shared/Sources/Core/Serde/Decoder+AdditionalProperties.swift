import Foundation

extension Swift.Decoder {
    func decodeAdditionalProperties<
        T: Swift.Decodable, C: Swift.CaseIterable & Swift.RawRepresentable
    >(
        using codingKeysType: C.Type
    ) throws
        -> [Swift.String: T] where C.RawValue == Swift.String
    {
        return try decodeAdditionalProperties(
            knownKeys: Swift.Set(codingKeysType.allCases.map(\.rawValue)))
    }

    func decodeAdditionalProperties<T: Swift.Decodable>(knownKeys: Swift.Set<Swift.String>) throws
        -> [Swift.String: T]
    {
        let container = try container(keyedBy: StringKey.self)
        let unknownKeys = Swift.Set(container.allKeys).subtracting(
            knownKeys.map(StringKey.init(_:)))
        guard !unknownKeys.isEmpty else { return .init() }
        let keyValuePairs: [(Swift.String, T)] = try unknownKeys.compactMap { key in
            (key.stringValue, try container.decode(T.self, forKey: key))
        }
        return .init(uniqueKeysWithValues: keyValuePairs)
    }
}
