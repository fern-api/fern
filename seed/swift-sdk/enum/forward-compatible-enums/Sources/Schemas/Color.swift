import Foundation

public enum Color: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case red
    case blue
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.red, .blue]

    public init(rawValue: String) {
        switch rawValue {
        case "red": self = .red
        case "blue": self = .blue
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .red: return "red"
        case .blue: return "blue"
        case .__unknown(let rawValue): return rawValue
        }
    }

    public init(from decoder: Decoder) throws {
        self.init(rawValue: try decoder.singleValueContainer().decode(String.self))
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(rawValue)
    }
}