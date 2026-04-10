pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeZeroType {
    #[serde(rename = "integerType")]
    IntegerType,
}
impl fmt::Display for VariableTypeZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::IntegerType => "integerType",
        };
        write!(f, "{}", s)
    }
}
