import Foundation

/// Undiscriminated unions can act as a map key
/// as long as all of their values are valid keys
/// (i.e. do they have a valid string representation).
public typealias Metadata = [Key: String]
