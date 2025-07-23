use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum VariableValue {
        IntegerValue {
            value: i32,
        },

        BooleanValue {
            value: bool,
        },

        DoubleValue {
            value: f64,
        },

        StringValue {
            value: String,
        },

        CharValue {
            value: String,
        },

        MapValue {
            #[serde(flatten)]
            data: MapValue,
        },

        ListValue {
            value: Vec<VariableValue>,
        },

        BinaryTreeValue {
            #[serde(flatten)]
            data: BinaryTreeValue,
        },

        SinglyLinkedListValue {
            #[serde(flatten)]
            data: SinglyLinkedListValue,
        },

        DoublyLinkedListValue {
            #[serde(flatten)]
            data: DoublyLinkedListValue,
        },

        NullValue,
}
