public enum FieldValue: Codable, Hashable, Sendable {
    case primitiveValue(PrimitiveValue)
    case objectValue(ObjectValue)
    case containerValue(ContainerValue)

    public struct PrimitiveValue: Codable, Hashable, Sendable {
        public let value: PrimitiveValue

        public init(value: PrimitiveValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ObjectValue: Codable, Hashable, Sendable {
        public let type: String = "object_value"
        public let additionalProperties: [String: JSONValue]

        public init(type: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ContainerValue: Codable, Hashable, Sendable {
        public let value: ContainerValue

        public init(value: ContainerValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}