pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TestSubmissionUpdateInfoFiveType {
    #[serde(rename = "finished")]
    Finished,
}
impl fmt::Display for TestSubmissionUpdateInfoFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Finished => "finished",
        };
        write!(f, "{}", s)
    }
}
