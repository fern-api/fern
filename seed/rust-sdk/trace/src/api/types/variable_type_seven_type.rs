pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeSevenType {
    #[serde(rename = "binaryTreeType")]
    BinaryTreeType,
}
impl fmt::Display for VariableTypeSevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::BinaryTreeType => "binaryTreeType",
        };
        write!(f, "{}", s)
    }
}
