import Foundation

public struct Foo: Codable, Hashable, Sendable {
    public let normal: String
    public let read: String
    public let write: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        normal: String,
        read: String,
        write: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.normal = normal
        self.read = read
        self.write = write
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.normal = try container.decode(String.self, forKey: .normal)
        self.read = try container.decode(String.self, forKey: .read)
        self.write = try container.decode(String.self, forKey: .write)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.normal, forKey: .normal)
        try container.encode(self.read, forKey: .read)
        try container.encode(self.write, forKey: .write)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case normal
        case read
        case write
    }
}