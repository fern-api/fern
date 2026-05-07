import Foundation

public struct EndpointsPutResponse: Codable, Hashable, Sendable {
    public let errors: Nullable<[EndpointsError]>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        errors: Nullable<[EndpointsError]>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.errors = errors
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.errors = try container.decodeNullableIfPresent([EndpointsError].self, forKey: .errors)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.errors, forKey: .errors)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case errors
    }
}