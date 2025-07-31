public enum UnionWithDuplicatePrimitive: Codable, Hashable, Sendable {
    case integer1(Integer1)
    case integer2(Integer2)
    case string1(String1)
    case string2(String2)

    public struct Integer1: Codable, Hashable, Sendable {
        public let value: Int

        public init(value: Int) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Integer2: Codable, Hashable, Sendable {
        public let value: Int

        public init(value: Int) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct String1: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct String2: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}