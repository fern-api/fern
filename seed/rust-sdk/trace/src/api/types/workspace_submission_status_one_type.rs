pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionStatusOneType {
    #[serde(rename = "errored")]
    Errored,
}
impl fmt::Display for WorkspaceSubmissionStatusOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Errored => "errored",
        };
        write!(f, "{}", s)
    }
}
