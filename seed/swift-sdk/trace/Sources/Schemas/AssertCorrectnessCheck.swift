public enum AssertCorrectnessCheck: Codable, Hashable, Sendable {
    case deepEquality(DeepEquality)
    case custom(Custom)

    public struct DeepEquality: Codable, Hashable, Sendable {
        public let type: String = "deepEquality"
        public let expectedValueParameterId: ParameterId
        public let additionalProperties: [String: JSONValue]

        public init(type: String, expectedValueParameterId: ParameterId, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let additionalParameters: [Parameter]
        public let code: FunctionImplementationForMultipleLanguages
        public let additionalProperties: [String: JSONValue]

        public init(type: String, additionalParameters: [Parameter], code: FunctionImplementationForMultipleLanguages, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}