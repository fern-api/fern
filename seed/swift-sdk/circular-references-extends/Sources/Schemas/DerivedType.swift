import Foundation

public struct DerivedType: Codable, Hashable, Sendable {
    public let childRef: ChildType?
    public let derivedName: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        childRef: ChildType? = nil,
        derivedName: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.childRef = childRef
        self.derivedName = derivedName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.childRef = try container.decodeIfPresent(ChildType.self, forKey: .childRef)
        self.derivedName = try container.decode(String.self, forKey: .derivedName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.childRef, forKey: .childRef)
        try container.encode(self.derivedName, forKey: .derivedName)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case childRef = "child_ref"
        case derivedName = "derived_name"
    }
}