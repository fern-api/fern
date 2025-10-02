use crate::commons_list_type::ListType;
use crate::commons_map_type::MapType;
use serde::{Deserialize, Serialize};

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
