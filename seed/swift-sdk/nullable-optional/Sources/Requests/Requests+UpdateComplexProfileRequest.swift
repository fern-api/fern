import Foundation

extension Requests {
    public struct UpdateComplexProfileRequest: Codable, Hashable, Sendable {
        public let nullableRole: JSONValue?
        public let nullableStatus: JSONValue?
        public let nullableNotification: JSONValue?
        public let nullableSearchResult: JSONValue?
        public let nullableArray: JSONValue?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nullableRole: JSONValue? = nil,
            nullableStatus: JSONValue? = nil,
            nullableNotification: JSONValue? = nil,
            nullableSearchResult: JSONValue? = nil,
            nullableArray: JSONValue? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.nullableRole = nullableRole
            self.nullableStatus = nullableStatus
            self.nullableNotification = nullableNotification
            self.nullableSearchResult = nullableSearchResult
            self.nullableArray = nullableArray
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.nullableRole = try container.decodeIfPresent(JSONValue.self, forKey: .nullableRole)
            self.nullableStatus = try container.decodeIfPresent(JSONValue.self, forKey: .nullableStatus)
            self.nullableNotification = try container.decodeIfPresent(JSONValue.self, forKey: .nullableNotification)
            self.nullableSearchResult = try container.decodeIfPresent(JSONValue.self, forKey: .nullableSearchResult)
            self.nullableArray = try container.decodeIfPresent(JSONValue.self, forKey: .nullableArray)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.nullableRole, forKey: .nullableRole)
            try container.encodeIfPresent(self.nullableStatus, forKey: .nullableStatus)
            try container.encodeIfPresent(self.nullableNotification, forKey: .nullableNotification)
            try container.encodeIfPresent(self.nullableSearchResult, forKey: .nullableSearchResult)
            try container.encodeIfPresent(self.nullableArray, forKey: .nullableArray)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case nullableRole
            case nullableStatus
            case nullableNotification
            case nullableSearchResult
            case nullableArray
        }
    }
}