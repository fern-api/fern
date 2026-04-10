pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionUpdateInfoTwoType {
    #[serde(rename = "stopped")]
    Stopped,
}
impl fmt::Display for WorkspaceSubmissionUpdateInfoTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Stopped => "stopped",
        };
        write!(f, "{}", s)
    }
}
