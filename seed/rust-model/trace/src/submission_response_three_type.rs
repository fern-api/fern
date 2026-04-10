pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionResponseThreeType {
    #[serde(rename = "serverErrored")]
    ServerErrored,
}
impl fmt::Display for SubmissionResponseThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ServerErrored => "serverErrored",
        };
        write!(f, "{}", s)
    }
}
