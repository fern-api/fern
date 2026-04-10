pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionStatusV2ZeroType {
    #[serde(rename = "test")]
    Test,
}
impl fmt::Display for SubmissionStatusV2ZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Test => "test",
        };
        write!(f, "{}", s)
    }
}
