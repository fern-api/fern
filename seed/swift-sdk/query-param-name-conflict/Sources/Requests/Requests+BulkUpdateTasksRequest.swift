import Foundation

extension Requests {
    public struct BulkUpdateTasksRequest: Codable, Hashable, Sendable {
        public let bulkUpdateTasksRequestAssignedTo: String?
        public let bulkUpdateTasksRequestDate: CalendarDate?
        public let bulkUpdateTasksRequestIsComplete: Bool?
        public let text: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            bulkUpdateTasksRequestAssignedTo: String? = nil,
            bulkUpdateTasksRequestDate: CalendarDate? = nil,
            bulkUpdateTasksRequestIsComplete: Bool? = nil,
            text: String? = nil,
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
            self.bulkUpdateTasksRequestAssignedTo = try container.decodeIfPresent(String.self, forKey: .bulkUpdateTasksRequestAssignedTo)
            self.bulkUpdateTasksRequestDate = try container.decodeIfPresent(CalendarDate.self, forKey: .bulkUpdateTasksRequestDate)
            self.bulkUpdateTasksRequestIsComplete = try container.decodeIfPresent(Bool.self, forKey: .bulkUpdateTasksRequestIsComplete)
            self.text = try container.decodeIfPresent(String.self, forKey: .text)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.bulkUpdateTasksRequestAssignedTo, forKey: .bulkUpdateTasksRequestAssignedTo)
            try container.encodeIfPresent(self.bulkUpdateTasksRequestDate, forKey: .bulkUpdateTasksRequestDate)
            try container.encodeIfPresent(self.bulkUpdateTasksRequestIsComplete, forKey: .bulkUpdateTasksRequestIsComplete)
            try container.encodeIfPresent(self.text, forKey: .text)
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