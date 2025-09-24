import Foundation

/// Represents a file with its data and optional metadata for multipart uploads
public struct FormFile {
    /// The file data
    public let data: Data
    /// Optional filename
    public let filename: String?

    public init(data: Data, filename: String? = nil) {
        self.data = data
        self.filename = filename
    }
}

// MARK: - Convenience Initializers

extension FormFile {
    /// Create a FormFile from raw Data with no metadata
    /// - Parameter data: The file data
    public static func data(_ data: Data) -> FormFile {
        return FormFile(data: data)
    }

    /// Create a FormFile from Data with a filename
    /// - Parameters:
    ///   - data: The file data
    ///   - filename: The filename
    public static func named(_ data: Data, filename: String) -> FormFile {
        return FormFile(data: data, filename: filename)
    }
}
