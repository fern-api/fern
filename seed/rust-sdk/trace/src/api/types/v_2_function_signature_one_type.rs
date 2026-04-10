pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2FunctionSignatureOneType {
    #[serde(rename = "nonVoid")]
    NonVoid,
}
impl fmt::Display for V2FunctionSignatureOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::NonVoid => "nonVoid",
        };
        write!(f, "{}", s)
    }
}
