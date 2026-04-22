import Foundation

struct StringKey: Swift.CodingKey, Swift.Hashable {
    var stringValue: Swift.String
    var intValue: Swift.Int? { Swift.Int(stringValue) }

    init(_ string: Swift.String) {
        self.stringValue = string
    }

    init?(stringValue: Swift.String) {
        self.stringValue = stringValue
    }

    init?(intValue: Swift.Int) {
        self.stringValue = Swift.String(intValue)
    }
}
