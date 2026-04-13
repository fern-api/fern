pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FailureStatus {
    #[serde(rename = "failure")]
    Failure,
}
impl fmt::Display for FailureStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Failure => "failure",
        };
        write!(f, "{}", s)
    }
}
