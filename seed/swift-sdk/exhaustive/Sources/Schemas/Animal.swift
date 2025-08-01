public enum Animal: Codable, Hashable, Sendable {
    case dog(Dog)
    case cat(Cat)

    public struct Dog: Codable, Hashable, Sendable {
        public let animal: String = "dog"
        public let name: String
        public let likesToWoof: Bool
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            name: String,
            likesToWoof: Bool,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.likesToWoof = likesToWoof
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.likesToWoof = try container.decode(Bool.self, forKey: .likesToWoof)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.likesToWoof, forKey: .likesToWoof)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case name = "placeholder"
            case likesToWoof = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Cat: Codable, Hashable, Sendable {
        public let animal: String = "cat"
        public let name: String
        public let likesToMeow: Bool
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            name: String,
            likesToMeow: Bool,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.likesToMeow = likesToMeow
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.likesToMeow = try container.decode(Bool.self, forKey: .likesToMeow)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.likesToMeow, forKey: .likesToMeow)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case name = "placeholder"
            case likesToMeow = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}