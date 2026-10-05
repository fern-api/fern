import Foundation

public struct PlaidError: Codable, Hashable, Sendable {
    public let errorType: String
    public let errorCode: String
    public let errorMessage: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        errorType: String,
        errorCode: String,
        errorMessage: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.errorType = errorType
        self.errorCode = errorCode
        self.errorMessage = errorMessage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.errorType = try container.decode(String.self, forKey: .errorType)
        self.errorCode = try container.decode(String.self, forKey: .errorCode)
        self.errorMessage = try container.decode(String.self, forKey: .errorMessage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.errorType, forKey: .errorType)
        try container.encode(self.errorCode, forKey: .errorCode)
        try container.encode(self.errorMessage, forKey: .errorMessage)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case errorType = "error_type"
        case errorCode = "error_code"
        case errorMessage = "error_message"
    }
}