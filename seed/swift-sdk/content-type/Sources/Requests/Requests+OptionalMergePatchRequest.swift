import Foundation

extension Requests {
    public struct OptionalMergePatchRequest: Codable, Hashable, Sendable {
        public let requiredField: String
        public let optionalString: String?
        public let optionalInteger: Int?
        public let optionalBoolean: Bool?
        public let nullableString: JSONValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            requiredField: String,
            optionalString: String? = nil,
            optionalInteger: Int? = nil,
            optionalBoolean: Bool? = nil,
            nullableString: JSONValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.requiredField = requiredField
            self.optionalString = optionalString
            self.optionalInteger = optionalInteger
            self.optionalBoolean = optionalBoolean
            self.nullableString = nullableString
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.requiredField = try container.decode(String.self, forKey: .requiredField)
            self.optionalString = try container.decodeIfPresent(String.self, forKey: .optionalString)
            self.optionalInteger = try container.decodeIfPresent(Int.self, forKey: .optionalInteger)
            self.optionalBoolean = try container.decodeIfPresent(Bool.self, forKey: .optionalBoolean)
            self.nullableString = try container.decode(JSONValue.self, forKey: .nullableString)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.requiredField, forKey: .requiredField)
            try container.encodeIfPresent(self.optionalString, forKey: .optionalString)
            try container.encodeIfPresent(self.optionalInteger, forKey: .optionalInteger)
            try container.encodeIfPresent(self.optionalBoolean, forKey: .optionalBoolean)
            try container.encode(self.nullableString, forKey: .nullableString)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case requiredField
            case optionalString
            case optionalInteger
            case optionalBoolean
            case nullableString
        }
    }
}