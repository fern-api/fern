import Foundation

public struct Error: Codable, Hashable, Sendable {
    public let category: ErrorCategory
    public let code: ErrorCode
    public let detail: String?
    public let field: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        category: ErrorCategory,
        code: ErrorCode,
        detail: String? = nil,
        field: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.category = category
        self.code = code
        self.detail = detail
        self.field = field
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.category = try container.decode(ErrorCategory.self, forKey: .category)
        self.code = try container.decode(ErrorCode.self, forKey: .code)
        self.detail = try container.decodeIfPresent(String.self, forKey: .detail)
        self.field = try container.decodeIfPresent(String.self, forKey: .field)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.category, forKey: .category)
        try container.encode(self.code, forKey: .code)
        try container.encodeIfPresent(self.detail, forKey: .detail)
        try container.encodeIfPresent(self.field, forKey: .field)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case category
        case code
        case detail
        case field
    }
}