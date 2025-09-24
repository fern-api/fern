use crate::nullable_optional_deserialization_test_request::DeserializationTestRequest;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeserializationTestResponse {
    pub echo: DeserializationTestRequest,
    #[serde(rename = "processedAt")]
    pub processed_at: chrono::DateTime<chrono::Utc>,
    #[serde(rename = "nullCount")]
    pub null_count: i32,
    #[serde(rename = "presentFieldsCount")]
    pub present_fields_count: i32,
}