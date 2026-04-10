import Foundation

extension Requests {
    public struct DeployParams: Codable, Hashable, Sendable {
        public let updateDraft: Nullable<Bool>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            updateDraft: Nullable<Bool>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.updateDraft = updateDraft
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.updateDraft = try container.decodeNullableIfPresent(Bool.self, forKey: .updateDraft)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.updateDraft, forKey: .updateDraft)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case updateDraft
        }
    }
}