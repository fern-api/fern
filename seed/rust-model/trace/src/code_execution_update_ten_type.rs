pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateTenType {
    #[serde(rename = "finished")]
    Finished,
}
impl fmt::Display for CodeExecutionUpdateTenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Finished => "finished",
        };
        write!(f, "{}", s)
    }
}
