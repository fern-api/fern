import Foundation

/// Represents a value that can be either a concrete value or explicit `null`, distinguishing between null and missing fields in JSON.
public enum Nullable<Wrapped>: Codable, Hashable, Sendable
where Wrapped: Codable & Hashable & Sendable {
    case value(Wrapped)
    case null

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self = .null
        } else {
            let wrappedValue = try container.decode(Wrapped.self)
            self = .value(wrappedValue)
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch self {
        case .value(let wrapped):
            try container.encode(wrapped)
        case .null:
            try container.encodeNil()
        }
    }

    /// Returns the wrapped value if present, otherwise nil
    public var wrappedValue: Wrapped? {
        switch self {
        case .value(let wrapped):
            return wrapped
        case .null:
            return nil
        }
    }

    /// Returns true if this contains an explicit null value
    public var isNull: Bool {
        switch self {
        case .value(_):
            return false
        case .null:
            return true
        }
    }

    /// Convenience initializer from optional value
    public init(_ value: Wrapped?) {
        if let value = value {
            self = .value(value)
        } else {
            self = .null
        }
    }
}
