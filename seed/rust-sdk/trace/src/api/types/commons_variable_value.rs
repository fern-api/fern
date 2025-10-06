pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CommonsVariableValue {
    IntegerValue {
        value: i64,
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
        data: CommonsMapValue,
    },

    ListValue {
        value: Vec<CommonsVariableValue>,
    },

    BinaryTreeValue {
        #[serde(flatten)]
        data: CommonsBinaryTreeValue,
    },

    SinglyLinkedListValue {
        #[serde(flatten)]
        data: CommonsSinglyLinkedListValue,
    },

    DoublyLinkedListValue {
        #[serde(flatten)]
        data: CommonsDoublyLinkedListValue,
    },

    NullValue,
}
