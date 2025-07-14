public struct TestCaseWithActualResultImplementation: Codable, Hashable {
    public let getActualResult: NonVoidFunctionDefinition
    public let assertCorrectnessCheck: AssertCorrectnessCheck
}