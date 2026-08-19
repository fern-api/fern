import Foundation

public indirect enum Node: Codable, Hashable, Sendable {
    case branchNode(BranchNode)
    case leafNode(LeafNode)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(BranchNode.self) {
            self = .branchNode(value)
        } else if let value = try? container.decode(LeafNode.self) {
            self = .leafNode(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
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