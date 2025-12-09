pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum VariableType {
    IntegerType,

    DoubleType,

    BooleanType,

    StringType,

    CharType,

    ListType {
        #[serde(flatten)]
        data: Box<ListType>,
    },

    MapType {
        #[serde(flatten)]
        data: Box<MapType>,
    },

    BinaryTreeType,

    SinglyLinkedListType,

    DoublyLinkedListType,
}
