pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionRequestTwoType {
    #[serde(rename = "submitV2")]
    SubmitV2,
}
impl fmt::Display for SubmissionRequestTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SubmitV2 => "submitV2",
        };
        write!(f, "{}", s)
    }
}
