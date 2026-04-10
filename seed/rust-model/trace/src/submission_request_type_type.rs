pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionRequestTypeType {
    #[serde(rename = "initializeWorkspaceRequest")]
    InitializeWorkspaceRequest,
}
impl fmt::Display for SubmissionRequestTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::InitializeWorkspaceRequest => "initializeWorkspaceRequest",
        };
        write!(f, "{}", s)
    }
}
