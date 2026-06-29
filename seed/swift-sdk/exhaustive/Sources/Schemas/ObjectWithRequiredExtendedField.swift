import Foundation

/// Tests that a struct with a required field whose type extends a non-Default
/// base type does NOT incorrectly derive Default in Rust. Reproduces the bug
/// where namedTypeSupportsDefault only checked properties but not extends.
public struct ObjectWithRequiredExtendedField: Codable, Hashable, Sendable {
    public let requiredExtended: ExtendedObjectWithInheritedEnum
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        requiredExtended: ExtendedObjectWithInheritedEnum,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.requiredExtended = requiredExtended
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.requiredExtended = try container.decode(ExtendedObjectWithInheritedEnum.self, forKey: .requiredExtended)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.requiredExtended, forKey: .requiredExtended)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case requiredExtended
    }
}