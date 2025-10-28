import Foundation

/// Type-erased wrapper for encodable values
struct EncodableValue {
    let value: Swift.Any

    init<T: Encodable>(_ value: T) {
        self.value = value
    }
}
