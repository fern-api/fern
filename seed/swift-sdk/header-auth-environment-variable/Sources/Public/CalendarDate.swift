import Foundation

/// Represents a calendar date without time information, following RFC 3339 section 5.6 (`YYYY-MM-DD` format)
public struct CalendarDate: Swift.Codable, Swift.Hashable, Swift.Sendable, Swift
        .CustomStringConvertible, Swift.Comparable
{
    /// The year component (expected range: 1-9999)
    public let year: Swift.Int

    /// The month component (valid range: 1-12)
    public let month: Swift.Int

    /// The day component (valid range: 1-31, depending on month)
    public let day: Swift.Int

    /// Failable initializer for creating a CalendarDate with validation
    public init?(year: Swift.Int, month: Swift.Int, day: Swift.Int) {
        guard Self.isValidDate(year: year, month: month, day: day) else {
            return nil
        }
        self.year = year
        self.month = month
        self.day = day
    }

    /// Failable initializer for creating a CalendarDate from a `YYYY-MM-DD` string
    public init?(_ dateString: Swift.String) {
        let components = dateString.split(separator: "-")
        guard components.count == 3,
            let year = Swift.Int(components[0]),
            let month = Swift.Int(components[1]),
            let day = Swift.Int(components[2])
        else {
            return nil
        }
        self.init(year: year, month: month, day: day)
    }

    // MARK: - Codable

    public init(from decoder: Swift.Decoder) throws {
        let container = try decoder.singleValueContainer()
        let dateString = try container.decode(String.self)
        guard let calendarDate = CalendarDate(dateString) else {
            throw Error.invalidFormat(dateString)
        }
        self = calendarDate
    }

    public func encode(to encoder: Swift.Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(description)
    }

    // MARK: - CustomStringConvertible

    public var description: Swift.String {
        // Format as YYYY-MM-DD with zero-padding
        // %04d = 4-digit year with leading zeros (e.g., 2025)
        // %02d = 2-digit month/day with leading zeros (e.g., 01, 05)
        Swift.String(format: "%04d-%02d-%02d", year, month, day)
    }

    // MARK: - Comparable

    public static func < (lhs: CalendarDate, rhs: CalendarDate) -> Swift.Bool {
        if lhs.year != rhs.year { return lhs.year < rhs.year }
        if lhs.month != rhs.month { return lhs.month < rhs.month }
        return lhs.day < rhs.day
    }

    // MARK: - Private Helpers

    /// Validates that the given year, month, and day form a valid calendar date using Foundation's Calendar APIs.
    private static func isValidDate(year: Swift.Int, month: Swift.Int, day: Swift.Int) -> Swift.Bool
    {
        let calendar = Foundation.Calendar(identifier: .gregorian)
        let components = Foundation.DateComponents(year: year, month: month, day: day)

        guard let date = calendar.date(from: components) else {
            return false
        }

        // Ensure the date components match what we created (handles invalid dates like Feb 30)
        let reconstructedComponents = calendar.dateComponents([.year, .month, .day], from: date)
        return
            (reconstructedComponents.year == year
            && reconstructedComponents.month == month
            && reconstructedComponents.day == day)
    }

    // MARK: - Error Types

    /// Errors that can occur when working with CalendarDate
    public enum Error: Swift.Error, Foundation.LocalizedError {
        case invalidFormat(Swift.String)

        public var errorDescription: Swift.String? {
            switch self {
            case .invalidFormat(let string):
                return "Invalid date format: '\(string)'. Expected YYYY-MM-DD"
            }
        }
    }
}
