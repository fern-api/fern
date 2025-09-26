use crate::commons_language::Language;
use crate::submission_submission_type_state::SubmissionTypeState;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_submitted: Option<DateTime<Utc>>,
    pub submission: String,
    pub language: Language,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionTypeState,
}
