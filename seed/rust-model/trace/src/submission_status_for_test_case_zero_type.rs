pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionStatusForTestCaseZeroType {
    #[serde(rename = "graded")]
    Graded,
}
impl fmt::Display for SubmissionStatusForTestCaseZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Graded => "graded",
        };
        write!(f, "{}", s)
    }
}
