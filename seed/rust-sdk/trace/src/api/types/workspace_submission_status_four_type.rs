pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionStatusFourType {
    #[serde(rename = "traced")]
    Traced,
}
impl fmt::Display for WorkspaceSubmissionStatusFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Traced => "traced",
        };
        write!(f, "{}", s)
    }
}
