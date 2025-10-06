pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_submitted: Option<DateTime<Utc>>,
    pub submission: String,
    pub language: Language,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionTypeState,
}
