pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionGetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_submitted: Option<DateTime<Utc>>,
    pub submission: String,
    pub language: CommonsLanguage,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionSubmissionTypeState,
}