public struct BinaryTreeNodeValue: Codable, Hashable {
    public let nodeId: NodeId
    public let val: Double
    public let right: NodeId?
    public let left: NodeId?
}