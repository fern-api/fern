import Foundation

public struct Directory: Codable, Hashable, Sendable {
    public let name: String
    public let files: Nullable<[File]>?
    public let directories: Nullable<[Directory]>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        files: Nullable<[File]>? = nil,
        directories: Nullable<[Directory]>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.files = files
        self.directories = directories
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.files = try container.decodeNullableIfPresent([File].self, forKey: .files)
        self.directories = try container.decodeNullableIfPresent([Directory].self, forKey: .directories)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encodeNullableIfPresent(self.files, forKey: .files)
        try container.encodeNullableIfPresent(self.directories, forKey: .directories)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case files
        case directories
    }
}