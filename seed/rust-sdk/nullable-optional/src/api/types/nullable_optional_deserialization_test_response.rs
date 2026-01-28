pub use crate::prelude::*;

/// Response for deserialization test
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeserializationTestResponse {
    pub echo: DeserializationTestRequest,
    #[serde(rename = "processedAt")]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub processed_at: DateTime<FixedOffset>,
    #[serde(rename = "nullCount")]
    pub null_count: i64,
    #[serde(rename = "presentFieldsCount")]
    pub present_fields_count: i64,
}