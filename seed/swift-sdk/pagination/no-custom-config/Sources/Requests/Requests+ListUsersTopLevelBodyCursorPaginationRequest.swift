import Foundation

extension Requests {
    public struct ListUsersTopLevelBodyCursorPaginationRequest: Codable, Hashable, Sendable {
        /// The cursor used for pagination in order to fetch
        /// the next page of results.
        public let cursor: String?
        /// An optional filter to apply to the results.
        public let filter: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            cursor: String? = nil,
            filter: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.cursor = cursor
            self.filter = filter
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.cursor = try container.decodeIfPresent(String.self, forKey: .cursor)
            self.filter = try container.decodeIfPresent(String.self, forKey: .filter)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.cursor, forKey: .cursor)
            try container.encodeIfPresent(self.filter, forKey: .filter)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case cursor
            case filter
        }
    }
}