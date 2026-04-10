pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2V3FunctionSignatureZeroType {
    #[serde(rename = "void")]
    Void,
}
impl fmt::Display for V2V3FunctionSignatureZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Void => "void",
        };
        write!(f, "{}", s)
    }
}
