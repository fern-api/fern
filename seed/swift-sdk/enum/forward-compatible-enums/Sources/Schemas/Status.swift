import Foundation

public enum Status: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case known
    case unknown
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.known, .unknown]

    public init(rawValue: String) {
        switch rawValue {
        case "Known": self = .known
        case "Unknown": self = .unknown
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .known: return "Known"
        case .unknown: return "Unknown"
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