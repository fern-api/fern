pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionResponseZeroType {
    #[serde(rename = "serverInitialized")]
    ServerInitialized,
}
impl fmt::Display for SubmissionResponseZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ServerInitialized => "serverInitialized",
        };
        write!(f, "{}", s)
    }
}
