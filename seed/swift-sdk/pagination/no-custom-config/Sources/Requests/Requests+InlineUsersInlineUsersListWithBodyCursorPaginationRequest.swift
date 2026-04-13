import Foundation

extension Requests {
    public struct InlineUsersInlineUsersListWithBodyCursorPaginationRequest: Codable, Hashable, Sendable {
        /// The object that contains the cursor used for pagination
        /// in order to fetch the next page of results.
        public let pagination: InlineUsersWithCursor?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            pagination: InlineUsersWithCursor? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.pagination = pagination
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.pagination = try container.decodeIfPresent(InlineUsersWithCursor.self, forKey: .pagination)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.pagination, forKey: .pagination)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case pagination
        }
    }
}