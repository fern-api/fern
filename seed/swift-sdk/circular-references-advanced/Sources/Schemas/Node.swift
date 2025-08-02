public enum Node: Codable, Hashable, Sendable {
    case branchNode(BranchNode)
    case leafNode(LeafNode)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .branchNode(let value):
            try container.encode(value)
        case .leafNode(let value):
            try container.encode(value)
        }
    }
}