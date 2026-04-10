pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateEightType {
    #[serde(rename = "recorded")]
    Recorded,
}
impl fmt::Display for CodeExecutionUpdateEightType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Recorded => "recorded",
        };
        write!(f, "{}", s)
    }
}
