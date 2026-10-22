public final class Indirect<T: Codable & Sendable>: Codable, @unchecked Sendable {
    public let value: T

    public init(_ value: T) {
        self.value = value
    }

    public convenience init(from decoder: Decoder) throws {
        self.init(try T(from: decoder))
    }

    public func encode(to encoder: Encoder) throws {
        try value.encode(to: encoder)
    }
}

extension Indirect: Equatable where T: Equatable {
    public static func == (lhs: Indirect<T>, rhs: Indirect<T>) -> Bool {
        lhs.value == rhs.value
    }
}

extension Indirect: Hashable where T: Hashable {
    public func hash(into hasher: inout Hasher) {
        hasher.combine(value)
    }
}
