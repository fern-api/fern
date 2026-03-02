pub use crate::prelude::*;

/// This type tests that string fields containing datetime-like values
/// are NOT reformatted by the wire test generator. The string field
/// should preserve its exact value even if it looks like a datetime.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ObjectWithDatetimeLikeString {
    /// A string field that happens to contain a datetime-like value
    #[serde(rename = "datetimeLikeString")]
    pub datetime_like_string: String,
    /// An actual datetime field for comparison
    #[serde(rename = "actualDatetime")]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub actual_datetime: DateTime<FixedOffset>,
}
