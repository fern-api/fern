import Foundation

extension Requests {
    public struct ServiceNamedPatchWithMixedRequest: Codable, Hashable, Sendable {
        public let appId: Nullable<String>?
        public let instructions: Nullable<String>
        public let active: Nullable<Bool>
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            appId: Nullable<String>? = nil,
            instructions: Nullable<String>,
            active: Nullable<Bool>,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.appId = appId
            self.instructions = instructions
            self.active = active
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.appId = try container.decodeNullableIfPresent(String.self, forKey: .appId)
            self.instructions = try container.decode(Nullable<String>.self, forKey: .instructions)
            self.active = try container.decode(Nullable<Bool>.self, forKey: .active)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.appId, forKey: .appId)
            try container.encode(self.instructions, forKey: .instructions)
            try container.encode(self.active, forKey: .active)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case appId
            case instructions
            case active
        }
    }
}