use crate::nullable_optional_deserialization_test_request::DeserializationTestRequest;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Response for deserialization test
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeserializationTestResponse {
    pub echo: DeserializationTestRequest,
    #[serde(rename = "processedAt")]
    pub processed_at: DateTime<Utc>,
    #[serde(rename = "nullCount")]
    pub null_count: i64,
    #[serde(rename = "presentFieldsCount")]
    pub present_fields_count: i64,
}