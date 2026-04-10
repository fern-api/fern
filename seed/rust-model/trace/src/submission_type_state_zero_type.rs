pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionTypeStateZeroType {
    #[serde(rename = "test")]
    Test,
}
impl fmt::Display for SubmissionTypeStateZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Test => "test",
        };
        write!(f, "{}", s)
    }
}
