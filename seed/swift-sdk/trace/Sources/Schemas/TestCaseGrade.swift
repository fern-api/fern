public enum TestCaseGrade: Codable, Hashable, Sendable {
    case hidden(Hidden)
    case nonHidden(NonHidden)

    public struct Hidden: Codable, Hashable, Sendable {
        public let type: String = "hidden"
        public let passed: Bool
        public let additionalProperties: [String: JSONValue]

        public init(type: String, passed: Bool, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct NonHidden: Codable, Hashable, Sendable {
        public let type: String = "nonHidden"
        public let passed: Bool
        public let actualResult: VariableValue?
        public let exception: ExceptionV2?
        public let stdout: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, passed: Bool, actualResult: VariableValue?, exception: ExceptionV2?, stdout: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}