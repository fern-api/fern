public enum ContainerValue: Codable, Hashable, Sendable {
    case list(List)
    case optional(Optional)

    public struct List: Codable, Hashable, Sendable {
        public let value: [FieldValue]

        public init(value: [FieldValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Optional: Codable, Hashable, Sendable {
        public let value: FieldValue?

        public init(value: FieldValue?) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}