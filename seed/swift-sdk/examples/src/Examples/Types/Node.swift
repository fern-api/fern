public struct Node: Codable, Hashable {
    public let name: String
    public let nodes: [Node]?
    public let trees: [Tree]?
}