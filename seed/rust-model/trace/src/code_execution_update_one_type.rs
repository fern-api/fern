pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateOneType {
    #[serde(rename = "running")]
    Running,
}
impl fmt::Display for CodeExecutionUpdateOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Running => "running",
        };
        write!(f, "{}", s)
    }
}
