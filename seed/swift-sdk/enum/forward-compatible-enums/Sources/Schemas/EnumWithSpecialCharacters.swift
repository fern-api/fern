import Foundation

public enum EnumWithSpecialCharacters: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case bla
    case yo
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.bla, .yo]

    public init(rawValue: String) {
        switch rawValue {
        case "\\$bla": self = .bla
        case "\\$yo": self = .yo
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .bla: return "\\$bla"
        case .yo: return "\\$yo"
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