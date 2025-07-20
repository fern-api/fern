use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(with = "chrono::serde::ts_seconds")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_submitted: Option<chrono::DateTime<chrono::Utc>>,
    pub submission: String,
    pub language: Language,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionTypeState,
}