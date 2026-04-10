pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ErrorInfoZeroType {
    #[serde(rename = "compileError")]
    CompileError,
}
impl fmt::Display for ErrorInfoZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CompileError => "compileError",
        };
        write!(f, "{}", s)
    }
}
