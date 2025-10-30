import Foundation

extension Requests {
    public struct UpdateComplexProfileRequest: Codable, Hashable, Sendable {
        public let nullableRole: UserRole?
        public let nullableStatus: UserStatus?
        public let nullableNotification: NotificationMethod?
        public let nullableSearchResult: SearchResult?
        public let nullableArray: [String]?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nullableRole: UserRole? = nil,
            nullableStatus: UserStatus? = nil,
            nullableNotification: NotificationMethod? = nil,
            nullableSearchResult: SearchResult? = nil,
            nullableArray: [String]? = nil,
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
            self.nullableRole = try container.decodeIfPresent(UserRole.self, forKey: .nullableRole)
            self.nullableStatus = try container.decodeIfPresent(UserStatus.self, forKey: .nullableStatus)
            self.nullableNotification = try container.decodeIfPresent(NotificationMethod.self, forKey: .nullableNotification)
            self.nullableSearchResult = try container.decodeIfPresent(SearchResult.self, forKey: .nullableSearchResult)
            self.nullableArray = try container.decodeIfPresent([String].self, forKey: .nullableArray)
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