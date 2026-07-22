import Foundation

extension Requests {
    public struct IdentifierUpdate: Codable, Hashable, Sendable {
        /// The identifier type to update.
        public let idType: String
        public let oldValue: String
        public let newValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            idType: String,
            oldValue: String,
            newValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.idType = idType
            self.oldValue = oldValue
            self.newValue = newValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.idType = try container.decode(String.self, forKey: .idType)
            self.oldValue = try container.decode(String.self, forKey: .oldValue)
            self.newValue = try container.decode(String.self, forKey: .newValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.idType, forKey: .idType)
            try container.encode(self.oldValue, forKey: .oldValue)
            try container.encode(self.newValue, forKey: .newValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case idType
            case oldValue
            case newValue
        }
    }
}