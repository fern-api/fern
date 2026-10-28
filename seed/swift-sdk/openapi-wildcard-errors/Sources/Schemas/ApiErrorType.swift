import Foundation

/// The shared error body returned for every 4XX and 5XX status.
public struct ApiErrorType: Codable, Hashable, Sendable {
    public let errorType: String
    public let errorCode: String
    public let errorMessage: String
    public let requestId: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        errorType: String,
        errorCode: String,
        errorMessage: String,
        requestId: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.errorType = errorType
        self.errorCode = errorCode
        self.errorMessage = errorMessage
        self.requestId = requestId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.errorType = try container.decode(String.self, forKey: .errorType)
        self.errorCode = try container.decode(String.self, forKey: .errorCode)
        self.errorMessage = try container.decode(String.self, forKey: .errorMessage)
        self.requestId = try container.decodeIfPresent(String.self, forKey: .requestId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.errorType, forKey: .errorType)
        try container.encode(self.errorCode, forKey: .errorCode)
        try container.encode(self.errorMessage, forKey: .errorMessage)
        try container.encodeIfPresent(self.requestId, forKey: .requestId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case errorType = "error_type"
        case errorCode = "error_code"
        case errorMessage = "error_message"
        case requestId = "request_id"
    }
}