pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CommonsDebugVariableValue {
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
            data: CommonsDebugMapValue,
        },

        ListValue {
            value: Vec<CommonsDebugVariableValue>,
        },

        BinaryTreeNodeValue {
            #[serde(flatten)]
            data: CommonsBinaryTreeNodeAndTreeValue,
        },

        SinglyLinkedListNodeValue {
            #[serde(flatten)]
            data: CommonsSinglyLinkedListNodeAndListValue,
        },

        DoublyLinkedListNodeValue {
            #[serde(flatten)]
            data: CommonsDoublyLinkedListNodeAndListValue,
        },

        UndefinedValue,

        NullValue,

        GenericValue {
            #[serde(flatten)]
            data: CommonsGenericValue,
        },
}
