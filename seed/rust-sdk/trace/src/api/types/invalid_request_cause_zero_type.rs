pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum InvalidRequestCauseZeroType {
    #[serde(rename = "submissionIdNotFound")]
    SubmissionIdNotFound,
}
impl fmt::Display for InvalidRequestCauseZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SubmissionIdNotFound => "submissionIdNotFound",
        };
        write!(f, "{}", s)
    }
}
