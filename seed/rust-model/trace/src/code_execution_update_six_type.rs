pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateSixType {
    #[serde(rename = "workspaceRan")]
    WorkspaceRan,
}
impl fmt::Display for CodeExecutionUpdateSixType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::WorkspaceRan => "workspaceRan",
        };
        write!(f, "{}", s)
    }
}
