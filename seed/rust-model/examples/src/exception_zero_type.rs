pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ExceptionZeroType {
    #[serde(rename = "generic")]
    Generic,
}
impl fmt::Display for ExceptionZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Generic => "generic",
        };
        write!(f, "{}", s)
    }
}
