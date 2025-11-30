pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum DebugVariableValue {
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
        data: Box<DebugMapValue>,
    },

    ListValue {
        value: Vec<Box<DebugVariableValue>>,
    },

    BinaryTreeNodeValue {
        #[serde(flatten)]
        data: BinaryTreeNodeAndTreeValue,
    },

    SinglyLinkedListNodeValue {
        #[serde(flatten)]
        data: SinglyLinkedListNodeAndListValue,
    },

    DoublyLinkedListNodeValue {
        #[serde(flatten)]
        data: DoublyLinkedListNodeAndListValue,
    },

    UndefinedValue,

    NullValue,

    GenericValue {
        #[serde(flatten)]
        data: GenericValue,
    },
}
