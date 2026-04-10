pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionResponseFourType {
    #[serde(rename = "codeExecutionUpdate")]
    CodeExecutionUpdate,
}
impl fmt::Display for SubmissionResponseFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CodeExecutionUpdate => "codeExecutionUpdate",
        };
        write!(f, "{}", s)
    }
}
