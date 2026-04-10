pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionRequestThreeType {
    #[serde(rename = "workspaceSubmit")]
    WorkspaceSubmit,
}
impl fmt::Display for SubmissionRequestThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::WorkspaceSubmit => "workspaceSubmit",
        };
        write!(f, "{}", s)
    }
}
