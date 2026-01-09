pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetSubmissionStateResponse {
    #[serde(rename = "timeSubmitted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub time_submitted: Option<DateTime<FixedOffset>>,
    pub submission: String,
    pub language: Language,
    #[serde(rename = "submissionTypeState")]
    pub submission_type_state: SubmissionTypeState,
}