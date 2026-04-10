pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionStatusThreeType {
    #[serde(rename = "ran")]
    Ran,
}
impl fmt::Display for WorkspaceSubmissionStatusThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Ran => "ran",
        };
        write!(f, "{}", s)
    }
}
