//! Flexible datetime parsing module
//!
//! This module provides serde helpers for parsing datetime strings that may or may not
//! include a timezone suffix. It accepts both RFC3339 format (with Z or +00:00 suffix)
//! and ISO 8601 format without timezone (assuming UTC).
//!
//! Supported formats:
//! - `2024-01-15T09:30:00Z` (RFC3339 with Z)
//! - `2024-01-15T09:30:00+00:00` (RFC3339 with offset)
//! - `2024-01-15T09:30:00` (ISO 8601 without timezone, assumes UTC)
//! - `2024-01-15T09:30:00.123Z` (with fractional seconds and Z)
//! - `2024-01-15T09:30:00.123` (with fractional seconds, no timezone)

use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{self, Deserialize, Deserializer, Serializer};

/// Serialize a DateTime<Utc> to RFC3339 format
pub fn serialize<S>(date: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&date.to_rfc3339())
}

/// Deserialize a datetime string that may or may not include a timezone suffix.
/// If no timezone is present, UTC is assumed.
pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    parse_flexible_datetime(&s).map_err(serde::de::Error::custom)
}

/// Parse a datetime string flexibly, accepting both RFC3339 and plain ISO 8601 formats.
fn parse_flexible_datetime(s: &str) -> Result<DateTime<Utc>, String> {
    // First, try parsing as RFC3339 (with timezone)
    if let Ok(dt) = DateTime::parse_from_rfc3339(s) {
        return Ok(dt.with_timezone(&Utc));
    }

    // Try parsing as NaiveDateTime (without timezone) and assume UTC
    // Try with fractional seconds first
    if let Ok(naive) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S%.f") {
        return Ok(naive.and_utc());
    }

    // Try without fractional seconds
    if let Ok(naive) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        return Ok(naive.and_utc());
    }

    Err(format!(
        "Failed to parse datetime '{}'. Expected RFC3339 format (e.g., '2024-01-15T09:30:00Z') \
         or ISO 8601 format (e.g., '2024-01-15T09:30:00')",
        s
    ))
}

/// Module for optional DateTime<Utc> fields with flexible parsing
pub mod option {
    use super::*;

    pub fn serialize<S>(date: &Option<DateTime<Utc>>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match date {
            Some(dt) => serializer.serialize_some(&dt.to_rfc3339()),
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<DateTime<Utc>>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt: Option<String> = Option::deserialize(deserializer)?;
        match opt {
            Some(s) => parse_flexible_datetime(&s)
                .map(Some)
                .map_err(serde::de::Error::custom),
            None => Ok(None),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_rfc3339_with_z() {
        let result = parse_flexible_datetime("2024-01-15T09:30:00Z");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_rfc3339_with_offset() {
        let result = parse_flexible_datetime("2024-01-15T09:30:00+00:00");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_without_timezone() {
        let result = parse_flexible_datetime("2024-01-15T09:30:00");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_with_fractional_seconds() {
        let result = parse_flexible_datetime("2024-01-15T09:30:00.123");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_with_fractional_seconds_and_z() {
        let result = parse_flexible_datetime("2024-01-15T09:30:00.123Z");
        assert!(result.is_ok());
    }
}
