pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeOneType {
    #[serde(rename = "doubleType")]
    DoubleType,
}
impl fmt::Display for VariableTypeOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DoubleType => "doubleType",
        };
        write!(f, "{}", s)
    }
}
