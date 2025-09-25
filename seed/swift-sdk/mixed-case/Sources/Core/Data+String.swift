import Foundation

// MARK: - Data + String Extensions
extension Data {
    /// Safely appends a UTF-8 encoded string to the data
    ///
    /// - Parameter string: The string to append
    mutating func appendUTF8String(_ string: String) {
        guard let data = string.data(using: .utf8) else {
            assertionFailure("Failed to encode string to UTF-8: \(string)")
            return
        }
        self.append(data)
    }
}
