pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionResponseOneType {
    #[serde(rename = "problemInitialized")]
    ProblemInitialized,
}
impl fmt::Display for SubmissionResponseOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ProblemInitialized => "problemInitialized",
        };
        write!(f, "{}", s)
    }
}
