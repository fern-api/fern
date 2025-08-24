import Foundation

extension Requests {

    public struct CreateUserRequest: Codable, Hashable, Sendable {
        /// The name of the user to create.
        /// This name is unique to each user.
        public let name: String
        /// The age of the user.
        /// This property is not required.
        public let age: Int?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String,
            age: Int? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.age = age
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.age = try container.decodeIfPresent(Int.self, forKey: .age)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.name, forKey: .name)
            try container.encodeIfPresent(self.age, forKey: .age)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case name
            case age
        }
    }
}