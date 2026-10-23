import Foundation

/// Tests enum name and value can be
/// different.
public enum Operand: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case greaterThan
    case equalTo
    /// The name and value should be similar
    /// are similar for less than.
    case lessThan
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.greaterThan, .equalTo, .lessThan]

    public init(rawValue: String) {
        switch rawValue {
        case ">": self = .greaterThan
        case "=": self = .equalTo
        case "less_than": self = .lessThan
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .greaterThan: return ">"
        case .equalTo: return "="
        case .lessThan: return "less_than"
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