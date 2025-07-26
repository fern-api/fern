use crate::debug_map_value::DebugMapValue;
use crate::binary_tree_node_and_tree_value::BinaryTreeNodeAndTreeValue;
use crate::singly_linked_list_node_and_list_value::SinglyLinkedListNodeAndListValue;
use crate::doubly_linked_list_node_and_list_value::DoublyLinkedListNodeAndListValue;
use crate::generic_value::GenericValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum DebugVariableValue {
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
            data: DebugMapValue,
        },

        ListValue {
            value: Vec<DebugVariableValue>,
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
