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
            data: ListType,
        },

        MapType {
            #[serde(flatten)]
            data: MapType,
        },

        BinaryTreeType,

        SinglyLinkedListType,

        DoublyLinkedListType,
}
