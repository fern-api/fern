import Foundation

/// Represents a calendar date without time information, following RFC 3339 section 5.6 (`YYYY-MM-DD` format)
public struct CalendarDate: Codable, Hashable, Sendable, CustomStringConvertible, Comparable {
    /// The year component (expected range: 1-9999)
    public let year: Int

    /// The month component (valid range: 1-12)
    public let month: Int

    /// The day component (valid range: 1-31, depending on month)
    public let day: Int

    /// Failable initializer for creating a CalendarDate with validation
    public init?(year: Int, month: Int, day: Int) {
        guard Self.isValidDate(year: year, month: month, day: day) else {
            return nil
        }
        self.year = year
        self.month = month
        self.day = day
    }

    /// Failable initializer for creating a CalendarDate from a `YYYY-MM-DD` string
    public init?(_ dateString: String) {
        let components = dateString.split(separator: "-")
        guard components.count == 3,
            let year = Int(components[0]),
            let month = Int(components[1]),
            let day = Int(components[2])
        else {
            return nil
        }
        self.init(year: year, month: month, day: day)
    }

    // MARK: - Codable

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let dateString = try container.decode(String.self)
        guard let calendarDate = CalendarDate(dateString) else {
            throw Error.invalidFormat(dateString)
        }
        self = calendarDate
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(description)
    }

    // MARK: - CustomStringConvertible

    public var description: String {
        // Format as YYYY-MM-DD with zero-padding
        // %04d = 4-digit year with leading zeros (e.g., 2025)
        // %02d = 2-digit month/day with leading zeros (e.g., 01, 05)
        String(format: "%04d-%02d-%02d", year, month, day)
    }

    // MARK: - Comparable

    public static func < (lhs: CalendarDate, rhs: CalendarDate) -> Bool {
        if lhs.year != rhs.year { return lhs.year < rhs.year }
        if lhs.month != rhs.month { return lhs.month < rhs.month }
        return lhs.day < rhs.day
    }

    // MARK: - Private Helpers

    /// Validates that the given year, month, and day form a valid calendar date using Foundation's Calendar APIs.
    private static func isValidDate(year: Int, month: Int, day: Int) -> Bool {
        let calendar = Calendar(identifier: .gregorian)
        let components = DateComponents(year: year, month: month, day: day)

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
    public enum Error: Swift.Error, LocalizedError {
        case invalidFormat(String)

        public var errorDescription: String? {
            switch self {
            case .invalidFormat(let string):
                return "Invalid date format: '\(string)'. Expected YYYY-MM-DD"
            }
        }
    }
}
