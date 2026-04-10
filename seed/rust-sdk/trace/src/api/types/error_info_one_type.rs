pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ErrorInfoOneType {
    #[serde(rename = "runtimeError")]
    RuntimeError,
}
impl fmt::Display for ErrorInfoOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::RuntimeError => "runtimeError",
        };
        write!(f, "{}", s)
    }
}
