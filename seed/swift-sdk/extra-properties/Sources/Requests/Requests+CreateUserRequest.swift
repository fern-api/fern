import Foundation

extension Requests {
    public struct CreateUserRequest: Codable, Hashable, Sendable {
        public let type: CreateUserRequest
        public let version: V1
        public let name: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            type: CreateUserRequest,
            version: V1,
            name: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.type = type
            self.version = version
            self.name = name
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.type = try container.decode(CreateUserRequest.self, forKey: .type)
            self.version = try container.decode(V1.self, forKey: .version)
            self.name = try container.decode(String.self, forKey: .name)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.version, forKey: .version)
            try container.encode(self.name, forKey: .name)
        }

        public enum CreateUserRequest: String, Codable, Hashable, CaseIterable, Sendable {
            case createUserRequest = "CreateUserRequest"
        }

        public enum V1: String, Codable, Hashable, CaseIterable, Sendable {
            case v1
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type = "_type"
            case version = "_version"
            case name
        }
    }
}