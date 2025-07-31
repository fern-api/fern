public enum TestCaseImplementationDescriptionBoard: Codable, Hashable, Sendable {
    case html(Html)
    case paramId(ParamId)

    public struct Html: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ParamId: Codable, Hashable, Sendable {
        public let value: ParameterId

        public init(value: ParameterId) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}