public enum TestCaseFunction: Codable, Hashable, Sendable {
    case withActualResult(WithActualResult)
    case custom(Custom)

    public struct WithActualResult: Codable, Hashable, Sendable {
        public let type: String = "withActualResult"
        public let getActualResult: NonVoidFunctionDefinition
        public let assertCorrectnessCheck: AssertCorrectnessCheck
        public let additionalProperties: [String: JSONValue]

        public init(type: String, getActualResult: NonVoidFunctionDefinition, assertCorrectnessCheck: AssertCorrectnessCheck, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let parameters: [Parameter]
        public let code: FunctionImplementationForMultipleLanguages
        public let additionalProperties: [String: JSONValue]

        public init(type: String, parameters: [Parameter], code: FunctionImplementationForMultipleLanguages, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}