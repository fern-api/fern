pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionResponseTwoType {
    #[serde(rename = "workspaceInitialized")]
    WorkspaceInitialized,
}
impl fmt::Display for SubmissionResponseTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::WorkspaceInitialized => "workspaceInitialized",
        };
        write!(f, "{}", s)
    }
}
