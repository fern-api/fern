pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum DebugVariableValue {
        #[serde(rename = "integerValue")]
        IntegerValue {
            value: i64,
        },

        #[serde(rename = "booleanValue")]
        BooleanValue {
            value: bool,
        },

        #[serde(rename = "doubleValue")]
        DoubleValue {
            value: f64,
        },

        #[serde(rename = "stringValue")]
        StringValue {
            value: String,
        },

        #[serde(rename = "charValue")]
        CharValue {
            value: String,
        },

        #[serde(rename = "mapValue")]
        MapValue {
            #[serde(flatten)]
            data: Box<DebugMapValue>,
        },

        #[serde(rename = "listValue")]
        ListValue {
            value: Vec<Box<DebugVariableValue>>,
        },

        #[serde(rename = "binaryTreeNodeValue")]
        BinaryTreeNodeValue {
            #[serde(flatten)]
            data: BinaryTreeNodeAndTreeValue,
        },

        #[serde(rename = "singlyLinkedListNodeValue")]
        SinglyLinkedListNodeValue {
            #[serde(flatten)]
            data: SinglyLinkedListNodeAndListValue,
        },

        #[serde(rename = "doublyLinkedListNodeValue")]
        DoublyLinkedListNodeValue {
            #[serde(flatten)]
            data: DoublyLinkedListNodeAndListValue,
        },

        #[serde(rename = "undefinedValue")]
        UndefinedValue,

        #[serde(rename = "nullValue")]
        NullValue,

        #[serde(rename = "genericValue")]
        GenericValue {
            #[serde(flatten)]
            data: GenericValue,
        },
}
