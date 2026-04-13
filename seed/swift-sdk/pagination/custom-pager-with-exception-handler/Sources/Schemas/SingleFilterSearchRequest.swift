import Foundation

public struct SingleFilterSearchRequest: Codable, Hashable, Sendable {
    public let field: Nullable<String>?
    public let `operator`: SingleFilterSearchRequestOperator?
    public let value: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        field: Nullable<String>? = nil,
        operator: SingleFilterSearchRequestOperator? = nil,
        value: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.field = field
        self.operator = `operator`
        self.value = value
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.field = try container.decodeNullableIfPresent(String.self, forKey: .field)
        self.operator = try container.decodeIfPresent(SingleFilterSearchRequestOperator.self, forKey: .operator)
        self.value = try container.decodeNullableIfPresent(String.self, forKey: .value)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.field, forKey: .field)
        try container.encodeIfPresent(self.operator, forKey: .operator)
        try container.encodeNullableIfPresent(self.value, forKey: .value)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case field
        case `operator`
        case value
    }
}