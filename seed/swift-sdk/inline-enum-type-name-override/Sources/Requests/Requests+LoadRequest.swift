import Foundation

extension Requests {
    public struct LoadRequest: Codable, Hashable, Sendable {
        public let cache: LoadRequestCache?
        public let status: LoadRequestStatus?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            cache: LoadRequestCache? = nil,
            status: LoadRequestStatus? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.cache = cache
            self.status = status
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.cache = try container.decodeIfPresent(LoadRequestCache.self, forKey: .cache)
            self.status = try container.decodeIfPresent(LoadRequestStatus.self, forKey: .status)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.cache, forKey: .cache)
            try container.encodeIfPresent(self.status, forKey: .status)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case cache
            case status
        }
    }
}