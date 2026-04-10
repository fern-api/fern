pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateSevenType {
    #[serde(rename = "recording")]
    Recording,
}
impl fmt::Display for CodeExecutionUpdateSevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Recording => "recording",
        };
        write!(f, "{}", s)
    }
}
