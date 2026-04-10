pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionTypeStateOneType {
    #[serde(rename = "workspace")]
    Workspace,
}
impl fmt::Display for SubmissionTypeStateOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Workspace => "workspace",
        };
        write!(f, "{}", s)
    }
}
