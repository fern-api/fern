import Foundation

extension Requests {
    public struct RuleCreateRequest: Codable, Hashable, Sendable {
        public let name: String
        public let executionContext: RuleExecutionContext
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String,
            executionContext: RuleExecutionContext,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.executionContext = executionContext
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.executionContext = try container.decode(RuleExecutionContext.self, forKey: .executionContext)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.executionContext, forKey: .executionContext)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case name
            case executionContext
        }
    }
}