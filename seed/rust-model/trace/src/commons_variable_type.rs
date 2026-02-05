pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum VariableType {
        #[serde(rename = "integerType")]
        IntegerType,

        #[serde(rename = "doubleType")]
        DoubleType,

        #[serde(rename = "booleanType")]
        BooleanType,

        #[serde(rename = "stringType")]
        StringType,

        #[serde(rename = "charType")]
        CharType,

        #[serde(rename = "listType")]
        ListType {
            #[serde(flatten)]
            data: Box<ListType>,
        },

        #[serde(rename = "mapType")]
        MapType {
            #[serde(flatten)]
            data: Box<MapType>,
        },

        #[serde(rename = "binaryTreeType")]
        BinaryTreeType,

        #[serde(rename = "singlyLinkedListType")]
        SinglyLinkedListType,

        #[serde(rename = "doublyLinkedListType")]
        DoublyLinkedListType,
}
