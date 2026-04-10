pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeThreeType {
    #[serde(rename = "stringType")]
    StringType,
}
impl fmt::Display for VariableTypeThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::StringType => "stringType",
        };
        write!(f, "{}", s)
    }
}
