pub use crate::prelude::*;

/// Response for deserialization test
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DeserializationTestResponse {
    #[serde(default)]
    pub echo: DeserializationTestRequest,
    #[serde(rename = "processedAt")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub processed_at: DateTime<FixedOffset>,
    #[serde(rename = "nullCount")]
    #[serde(default)]
    pub null_count: i64,
    #[serde(rename = "presentFieldsCount")]
    #[serde(default)]
    pub present_fields_count: i64,
}
