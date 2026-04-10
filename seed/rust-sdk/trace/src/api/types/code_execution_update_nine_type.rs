pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateNineType {
    #[serde(rename = "invalidRequest")]
    InvalidRequest,
}
impl fmt::Display for CodeExecutionUpdateNineType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::InvalidRequest => "invalidRequest",
        };
        write!(f, "{}", s)
    }
}
