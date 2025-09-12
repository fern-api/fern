import Foundation

extension Requests {
    public struct UpdateComplexProfileRequest: Codable, Hashable, Sendable {
        public let nullableRole: Nullable<UserRole>?
        public let nullableStatus: Nullable<UserStatus>?
        public let nullableNotification: Nullable<NotificationMethod>?
        public let nullableSearchResult: Nullable<SearchResult>?
        public let nullableArray: Nullable<[String]>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nullableRole: Nullable<UserRole>? = nil,
            nullableStatus: Nullable<UserStatus>? = nil,
            nullableNotification: Nullable<NotificationMethod>? = nil,
            nullableSearchResult: Nullable<SearchResult>? = nil,
            nullableArray: Nullable<[String]>? = nil,
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
            self.nullableRole = try container.decodeIfPresent(Nullable<UserRole>.self, forKey: .nullableRole)
            self.nullableStatus = try container.decodeIfPresent(Nullable<UserStatus>.self, forKey: .nullableStatus)
            self.nullableNotification = try container.decodeIfPresent(Nullable<NotificationMethod>.self, forKey: .nullableNotification)
            self.nullableSearchResult = try container.decodeIfPresent(Nullable<SearchResult>.self, forKey: .nullableSearchResult)
            self.nullableArray = try container.decodeIfPresent(Nullable<[String]>.self, forKey: .nullableArray)
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