import Foundation

/// A type that can represent any JSON value.
public enum JSONValue: Swift.Codable, Swift.Hashable, Swift.Sendable {
    case string(Swift.String)
    case number(Swift.Double)
    case bool(Swift.Bool)
    case null
    case array([JSONValue])
    case object([Swift.String: JSONValue])

    public init(from decoder: Swift.Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self = .null
        } else if let bool = try? container.decode(Swift.Bool.self) {
            self = .bool(bool)
        } else if let int = try? container.decode(Swift.Int.self) {
            self = .number(Swift.Double(int))
        } else if let double = try? container.decode(Swift.Double.self) {
            self = .number(double)
        } else if let string = try? container.decode(Swift.String.self) {
            self = .string(string)
        } else if let array = try? container.decode([JSONValue].self) {
            self = .array(array)
        } else if let object = try? container.decode([Swift.String: JSONValue].self) {
            self = .object(object)
        } else {
            throw Swift.DecodingError.dataCorrupted(
                Swift.DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unable to decode JSONValue"
                )
            )
        }
    }

    public func encode(to encoder: Swift.Encoder) throws {
        var container = encoder.singleValueContainer()

        switch self {
        case .string(let string):
            try container.encode(string)
        case .number(let number):
            try container.encode(number)
        case .bool(let bool):
            try container.encode(bool)
        case .null:
            try container.encodeNil()
        case .array(let array):
            try container.encode(array)
        case .object(let object):
            try container.encode(object)
        }
    }
}

// MARK: - Convenience initializers
extension JSONValue {
    public init(_ value: String) {
        self = .string(value)
    }

    public init(_ value: Int) {
        self = .number(Double(value))
    }

    public init(_ value: Double) {
        self = .number(value)
    }

    public init(_ value: Bool) {
        self = .bool(value)
    }

    public init(_ value: [JSONValue]) {
        self = .array(value)
    }

    public init(_ value: [String: JSONValue]) {
        self = .object(value)
    }
}

// MARK: - Value extraction
extension JSONValue {
    public var stringValue: String? {
        if case .string(let value) = self {
            return value
        }
        return nil
    }

    public var numberValue: Double? {
        if case .number(let value) = self {
            return value
        }
        return nil
    }

    public var intValue: Int? {
        if case .number(let value) = self {
            return Int(value)
        }
        return nil
    }

    public var boolValue: Bool? {
        if case .bool(let value) = self {
            return value
        }
        return nil
    }

    public var arrayValue: [JSONValue]? {
        if case .array(let value) = self {
            return value
        }
        return nil
    }

    public var objectValue: [String: JSONValue]? {
        if case .object(let value) = self {
            return value
        }
        return nil
    }

    public var isNull: Bool {
        if case .null = self {
            return true
        }
        return false
    }
}
