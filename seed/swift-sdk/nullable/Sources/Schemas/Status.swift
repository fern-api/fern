public enum Status: Codable, Hashable, Sendable {
    case active(Active)
    case archived(Archived)
    case softDeleted(SoftDeleted)

    public struct Active: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Archived: Codable, Hashable, Sendable {
        public let value: JSONValue

        public init(value: JSONValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct SoftDeleted: Codable, Hashable, Sendable {
        public let value: Date?

        public init(value: Date?) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}