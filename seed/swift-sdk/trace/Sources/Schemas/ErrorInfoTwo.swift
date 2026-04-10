import Foundation

public struct ErrorInfoTwo: Codable, Hashable, Sendable {
    public let exceptionInfo: ExceptionInfo
    public let type: ErrorInfoTwoType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        exceptionInfo: ExceptionInfo,
        type: ErrorInfoTwoType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.exceptionInfo = exceptionInfo
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.exceptionInfo = try container.decode(ExceptionInfo.self, forKey: .exceptionInfo)
        self.type = try container.decode(ErrorInfoTwoType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.exceptionInfo, forKey: .exceptionInfo)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case exceptionInfo
        case type
    }
}