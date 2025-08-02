public enum Node: Codable, Hashable, Sendable {
    case branchNode(BranchNode)
    case leafNode(LeafNode)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}