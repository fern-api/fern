pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateFiveType {
    #[serde(rename = "gradedV2")]
    GradedV2,
}
impl fmt::Display for CodeExecutionUpdateFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GradedV2 => "gradedV2",
        };
        write!(f, "{}", s)
    }
}
