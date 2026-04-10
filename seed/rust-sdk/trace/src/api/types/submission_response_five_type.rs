pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionResponseFiveType {
    #[serde(rename = "terminated")]
    Terminated,
}
impl fmt::Display for SubmissionResponseFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Terminated => "terminated",
        };
        write!(f, "{}", s)
    }
}
