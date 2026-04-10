pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueSevenType {
    #[serde(rename = "binaryTreeValue")]
    BinaryTreeValue,
}
impl fmt::Display for VariableValueSevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::BinaryTreeValue => "binaryTreeValue",
        };
        write!(f, "{}", s)
    }
}
