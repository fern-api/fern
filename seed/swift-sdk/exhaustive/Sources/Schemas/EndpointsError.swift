import Foundation

public struct EndpointsError: Codable, Hashable, Sendable {
    public let category: EndpointsErrorCategory
    public let code: EndpointsErrorCode
    public let detail: Nullable<String>?
    public let field: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        category: EndpointsErrorCategory,
        code: EndpointsErrorCode,
        detail: Nullable<String>? = nil,
        field: Nullable<String>? = nil,
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
        self.category = try container.decode(EndpointsErrorCategory.self, forKey: .category)
        self.code = try container.decode(EndpointsErrorCode.self, forKey: .code)
        self.detail = try container.decodeNullableIfPresent(String.self, forKey: .detail)
        self.field = try container.decodeNullableIfPresent(String.self, forKey: .field)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.category, forKey: .category)
        try container.encode(self.code, forKey: .code)
        try container.encodeNullableIfPresent(self.detail, forKey: .detail)
        try container.encodeNullableIfPresent(self.field, forKey: .field)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case category
        case code
        case detail
        case field
    }
}