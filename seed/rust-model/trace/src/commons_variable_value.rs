pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum VariableValue {
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
            data: Box<MapValue>,
        },

        #[serde(rename = "listValue")]
        ListValue {
            value: Vec<Box<VariableValue>>,
        },

        #[serde(rename = "binaryTreeValue")]
        BinaryTreeValue {
            #[serde(flatten)]
            data: BinaryTreeValue,
        },

        #[serde(rename = "singlyLinkedListValue")]
        SinglyLinkedListValue {
            #[serde(flatten)]
            data: SinglyLinkedListValue,
        },

        #[serde(rename = "doublyLinkedListValue")]
        DoublyLinkedListValue {
            #[serde(flatten)]
            data: DoublyLinkedListValue,
        },

        #[serde(rename = "nullValue")]
        NullValue,
}
