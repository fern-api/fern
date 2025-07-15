public struct TestCaseMetadata: Codable, Hashable {
    public let id: TestCaseId
    public let name: String
    public let hidden: Bool
}