import Foundation

extension Requests {
    public struct PostWithChildResource: Codable, Hashable, Sendable {
        public let childResource: ChildResource
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            childResource: ChildResource,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.childResource = childResource
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.childResource = try container.decode(ChildResource.self, forKey: .childResource)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.childResource, forKey: .childResource)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case childResource
        }
    }
}