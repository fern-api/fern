pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionUpdateInfoOneType {
    #[serde(rename = "ran")]
    Ran,
}
impl fmt::Display for WorkspaceSubmissionUpdateInfoOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Ran => "ran",
        };
        write!(f, "{}", s)
    }
}
