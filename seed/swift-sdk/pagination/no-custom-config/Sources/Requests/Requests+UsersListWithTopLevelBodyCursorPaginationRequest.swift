import Foundation

extension Requests {
    public struct UsersListWithTopLevelBodyCursorPaginationRequest: Codable, Hashable, Sendable {
        /// The cursor used for pagination in order to fetch
        /// the next page of results.
        public let cursor: Nullable<String>?
        /// An optional filter to apply to the results.
        public let filter: Nullable<String>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            cursor: Nullable<String>? = nil,
            filter: Nullable<String>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.cursor = cursor
            self.filter = filter
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.cursor = try container.decodeNullableIfPresent(String.self, forKey: .cursor)
            self.filter = try container.decodeNullableIfPresent(String.self, forKey: .filter)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.cursor, forKey: .cursor)
            try container.encodeNullableIfPresent(self.filter, forKey: .filter)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case cursor
            case filter
        }
    }
}