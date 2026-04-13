pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ExceptionTypeType {
    #[serde(rename = "timeout")]
    Timeout,
}
impl fmt::Display for ExceptionTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Timeout => "timeout",
        };
        write!(f, "{}", s)
    }
}
