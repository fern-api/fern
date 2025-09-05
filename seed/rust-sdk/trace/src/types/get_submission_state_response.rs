use crate::language::Language;
use crate::submission_type_state::SubmissionTypeState;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_submitted: Option<chrono::DateTime<chrono::Utc>>,
    pub submission: String,
    pub language: Language,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionTypeState,
}