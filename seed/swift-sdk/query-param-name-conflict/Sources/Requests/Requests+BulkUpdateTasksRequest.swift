import Foundation

extension Requests {
    public struct BulkUpdateTasksRequest: Codable, Hashable, Sendable {
        public let bulkUpdateTasksRequestAssignedTo: Nullable<String>?
        public let bulkUpdateTasksRequestDate: Nullable<CalendarDate>?
        public let bulkUpdateTasksRequestIsComplete: Nullable<Bool>?
        public let text: Nullable<String>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            bulkUpdateTasksRequestAssignedTo: Nullable<String>? = nil,
            bulkUpdateTasksRequestDate: Nullable<CalendarDate>? = nil,
            bulkUpdateTasksRequestIsComplete: Nullable<Bool>? = nil,
            text: Nullable<String>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.bulkUpdateTasksRequestAssignedTo = bulkUpdateTasksRequestAssignedTo
            self.bulkUpdateTasksRequestDate = bulkUpdateTasksRequestDate
            self.bulkUpdateTasksRequestIsComplete = bulkUpdateTasksRequestIsComplete
            self.text = text
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.bulkUpdateTasksRequestAssignedTo = try container.decodeNullableIfPresent(String.self, forKey: .bulkUpdateTasksRequestAssignedTo)
            self.bulkUpdateTasksRequestDate = try container.decodeNullableIfPresent(CalendarDate.self, forKey: .bulkUpdateTasksRequestDate)
            self.bulkUpdateTasksRequestIsComplete = try container.decodeNullableIfPresent(Bool.self, forKey: .bulkUpdateTasksRequestIsComplete)
            self.text = try container.decodeNullableIfPresent(String.self, forKey: .text)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.bulkUpdateTasksRequestAssignedTo, forKey: .bulkUpdateTasksRequestAssignedTo)
            try container.encodeNullableIfPresent(self.bulkUpdateTasksRequestDate, forKey: .bulkUpdateTasksRequestDate)
            try container.encodeNullableIfPresent(self.bulkUpdateTasksRequestIsComplete, forKey: .bulkUpdateTasksRequestIsComplete)
            try container.encodeNullableIfPresent(self.text, forKey: .text)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case bulkUpdateTasksRequestAssignedTo = "assigned_to"
            case bulkUpdateTasksRequestDate = "date"
            case bulkUpdateTasksRequestIsComplete = "is_complete"
            case text
        }
    }
}