import Foundation

extension Requests {
    public struct OutboundCallConversationsRequest: Codable, Hashable, Sendable {
        /// The phone number to call in E.164 format.
        public let toPhoneNumber: String
        /// If true, validates the outbound call setup without placing a call.
        public let dryRun: Bool?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            toPhoneNumber: String,
            dryRun: Bool? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.toPhoneNumber = toPhoneNumber
            self.dryRun = dryRun
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.toPhoneNumber = try container.decode(String.self, forKey: .toPhoneNumber)
            self.dryRun = try container.decodeIfPresent(Bool.self, forKey: .dryRun)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.toPhoneNumber, forKey: .toPhoneNumber)
            try container.encodeIfPresent(self.dryRun, forKey: .dryRun)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case toPhoneNumber = "to_phone_number"
            case dryRun = "dry_run"
        }
    }
}