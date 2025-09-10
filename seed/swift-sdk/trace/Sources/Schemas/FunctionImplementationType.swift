import Foundation

public struct FunctionImplementationType: Codable, Hashable, Sendable {
    public let impl: String
    public let imports: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        impl: String,
        imports: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.impl = impl
        self.imports = imports
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.impl = try container.decode(String.self, forKey: .impl)
        self.imports = try container.decodeIfPresent(String.self, forKey: .imports)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.impl, forKey: .impl)
        try container.encodeIfPresent(self.imports, forKey: .imports)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case impl
        case imports
    }
}