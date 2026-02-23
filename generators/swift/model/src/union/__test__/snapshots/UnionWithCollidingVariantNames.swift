public enum UnionWithCollidingVariantNames: Codable, Hashable, Sendable {
    case date(Date)
    case odds(Odds)
    case score(Score)
    case string(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(Swift.String.self, forKey: .type)
        switch discriminant {
        case "date":
            self = .date(try Date(from: decoder))
        case "odds":
            self = .odds(try Odds(from: decoder))
        case "score":
            self = .score(try Score(from: decoder))
        case "string":
            self = .string(try String(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .date(let data):
            try data.encode(to: encoder)
        case .odds(let data):
            try data.encode(to: encoder)
        case .score(let data):
            try data.encode(to: encoder)
        case .string(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Date: Codable, Hashable, Sendable {
        public let type: Swift.String = "date"
        public let day: Int
        public let month: Int
        public let year: Int
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [Swift.String: JSONValue]

        public init(
            day: Int,
            month: Int,
            year: Int,
            additionalProperties: [Swift.String: JSONValue] = .init()
        ) {
            self.day = day
            self.month = month
            self.year = year
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.day = try container.decode(Int.self, forKey: .day)
            self.month = try container.decode(Int.self, forKey: .month)
            self.year = try container.decode(Int.self, forKey: .year)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.day, forKey: .day)
            try container.encode(self.month, forKey: .month)
            try container.encode(self.year, forKey: .year)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case day
            case month
            case year
        }
    }

    public struct Score: Codable, Hashable, Sendable {
        public let type: Swift.String = "score"
        public let points: Int
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [Swift.String: JSONValue]

        public init(
            points: Int,
            additionalProperties: [Swift.String: JSONValue] = .init()
        ) {
            self.points = points
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.points = try container.decode(Int.self, forKey: .points)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.points, forKey: .points)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case points
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}