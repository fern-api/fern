pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TestSubmissionUpdateInfoZeroType {
    #[serde(rename = "running")]
    Running,
}
impl fmt::Display for TestSubmissionUpdateInfoZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Running => "running",
        };
        write!(f, "{}", s)
    }
}
