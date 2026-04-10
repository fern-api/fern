pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionUpdateInfoFiveType {
    #[serde(rename = "errored")]
    Errored,
}
impl fmt::Display for WorkspaceSubmissionUpdateInfoFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Errored => "errored",
        };
        write!(f, "{}", s)
    }
}
