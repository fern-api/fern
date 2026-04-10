pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ExceptionV2ZeroType {
    #[serde(rename = "generic")]
    Generic,
}
impl fmt::Display for ExceptionV2ZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Generic => "generic",
        };
        write!(f, "{}", s)
    }
}
