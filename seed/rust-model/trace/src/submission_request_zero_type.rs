pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionRequestZeroType {
    #[serde(rename = "initializeProblemRequest")]
    InitializeProblemRequest,
}
impl fmt::Display for SubmissionRequestZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::InitializeProblemRequest => "initializeProblemRequest",
        };
        write!(f, "{}", s)
    }
}
