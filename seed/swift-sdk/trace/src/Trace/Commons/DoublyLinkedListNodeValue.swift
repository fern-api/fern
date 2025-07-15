public struct DoublyLinkedListNodeValue: Codable, Hashable {
    public let nodeId: NodeId
    public let val: Double
    public let next: NodeId?
    public let prev: NodeId?
}