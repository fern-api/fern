import Foundation

public struct ChildType: Codable, Hashable, Sendable {
    public let childRef: Indirect<ChildType>?
    public let childName: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        childRef: ChildType? = nil,
        childName: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.childRef = childRef.map { Indirect($0) }
        self.childName = childName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.childRef = try container.decodeIfPresent(Indirect<ChildType>.self, forKey: .childRef)
        self.childName = try container.decode(String.self, forKey: .childName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.childRef, forKey: .childRef)
        try container.encode(self.childName, forKey: .childName)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case childRef = "child_ref"
        case childName = "child_name"
    }
}