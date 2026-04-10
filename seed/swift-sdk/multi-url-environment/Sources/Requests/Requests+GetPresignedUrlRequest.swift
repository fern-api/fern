import Foundation

extension Requests {
    public struct GetPresignedUrlRequest: Codable, Hashable, Sendable {
        public let s3Key: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            s3Key: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.s3Key = s3Key
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.s3Key = try container.decode(String.self, forKey: .s3Key)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.s3Key, forKey: .s3Key)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case s3Key
        }
    }
}