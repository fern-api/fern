import Foundation

public struct ErrorEvent: Codable, Hashable, Sendable {
    public let errorCode: Int
    public let errorMessage: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        errorCode: Int,
        errorMessage: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.errorCode = errorCode
        self.errorMessage = errorMessage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.errorCode = try container.decode(Int.self, forKey: .errorCode)
        self.errorMessage = try container.decode(String.self, forKey: .errorMessage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.errorCode, forKey: .errorCode)
        try container.encode(self.errorMessage, forKey: .errorMessage)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case errorCode
        case errorMessage
    }
}