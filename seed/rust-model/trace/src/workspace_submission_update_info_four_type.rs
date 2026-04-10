pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WorkspaceSubmissionUpdateInfoFourType {
    #[serde(rename = "tracedV2")]
    TracedV2,
}
impl fmt::Display for WorkspaceSubmissionUpdateInfoFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::TracedV2 => "tracedV2",
        };
        write!(f, "{}", s)
    }
}
