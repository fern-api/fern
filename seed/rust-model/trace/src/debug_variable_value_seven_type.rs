pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueSevenType {
    #[serde(rename = "binaryTreeNodeValue")]
    BinaryTreeNodeValue,
}
impl fmt::Display for DebugVariableValueSevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::BinaryTreeNodeValue => "binaryTreeNodeValue",
        };
        write!(f, "{}", s)
    }
}
