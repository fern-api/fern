import Foundation

extension Decoder {
    func decodeAdditionalProperties<T: Decodable, C: CaseIterable & RawRepresentable>(
        using codingKeysType: C.Type
    ) throws
        -> [String: T] where C.RawValue == String
    {
        return try decodeAdditionalProperties(
            knownKeys: Set(codingKeysType.allCases.map(\.rawValue)))
    }

    func decodeAdditionalProperties<T: Decodable>(knownKeys: Set<String>) throws -> [String:
        T]
    {
        let container = try container(keyedBy: StringKey.self)
        let unknownKeys = Set(container.allKeys).subtracting(knownKeys.map(StringKey.init(_:)))
        guard !unknownKeys.isEmpty else { return .init() }
        let keyValuePairs: [(String, T)] = try unknownKeys.compactMap { key in
            (key.stringValue, try container.decode(T.self, forKey: key))
        }
        return .init(uniqueKeysWithValues: keyValuePairs)
    }
}
