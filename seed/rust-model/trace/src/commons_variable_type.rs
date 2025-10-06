pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CommonsVariableType {
        IntegerType,

        DoubleType,

        BooleanType,

        StringType,

        CharType,

        ListType {
            #[serde(flatten)]
            data: CommonsListType,
        },

        MapType {
            #[serde(flatten)]
            data: CommonsMapType,
        },

        BinaryTreeType,

        SinglyLinkedListType,

        DoublyLinkedListType,
}
