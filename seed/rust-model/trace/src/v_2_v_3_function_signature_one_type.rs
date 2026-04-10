pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2V3FunctionSignatureOneType {
    #[serde(rename = "nonVoid")]
    NonVoid,
}
impl fmt::Display for V2V3FunctionSignatureOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::NonVoid => "nonVoid",
        };
        write!(f, "{}", s)
    }
}
