import Foundation

public struct BaseType: Codable, Hashable, Sendable {
    public let childRef: ChildType?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        childRef: ChildType? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.childRef = childRef
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.childRef = try container.decodeIfPresent(ChildType.self, forKey: .childRef)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.childRef, forKey: .childRef)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case childRef = "child_ref"
    }
}