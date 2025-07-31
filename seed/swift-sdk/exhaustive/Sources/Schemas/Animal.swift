public enum Animal: Codable, Hashable, Sendable {
    case dog(Dog)
    case cat(Cat)

    public struct Dog: Codable, Hashable, Sendable {
        public let animal: String = "dog"
        public let name: String
        public let likesToWoof: Bool
        public let additionalProperties: [String: JSONValue]

        public init(animal: String, name: String, likesToWoof: Bool, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Cat: Codable, Hashable, Sendable {
        public let animal: String = "cat"
        public let name: String
        public let likesToMeow: Bool
        public let additionalProperties: [String: JSONValue]

        public init(animal: String, name: String, likesToMeow: Bool, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}