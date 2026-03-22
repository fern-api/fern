pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum DebugVariableValue {
    #[serde(rename = "integerValue")]
    #[non_exhaustive]
    IntegerValue { value: i64 },

    #[serde(rename = "booleanValue")]
    #[non_exhaustive]
    BooleanValue { value: bool },

    #[serde(rename = "doubleValue")]
    #[non_exhaustive]
    DoubleValue { value: f64 },

    #[serde(rename = "stringValue")]
    #[non_exhaustive]
    StringValue { value: String },

    #[serde(rename = "charValue")]
    #[non_exhaustive]
    CharValue { value: String },

    #[serde(rename = "mapValue")]
    #[non_exhaustive]
    MapValue {
        #[serde(rename = "keyValuePairs")]
        #[serde(default)]
        key_value_pairs: Vec<Box<DebugKeyValuePairs>>,
    },

    #[serde(rename = "listValue")]
    #[non_exhaustive]
    ListValue { value: Vec<Box<DebugVariableValue>> },

    #[serde(rename = "binaryTreeNodeValue")]
    #[non_exhaustive]
    BinaryTreeNodeValue {
        #[serde(rename = "nodeId")]
        #[serde(default)]
        node_id: NodeId,
        #[serde(rename = "fullTree")]
        #[serde(default)]
        full_tree: BinaryTreeValue,
    },

    #[serde(rename = "singlyLinkedListNodeValue")]
    #[non_exhaustive]
    SinglyLinkedListNodeValue {
        #[serde(rename = "nodeId")]
        #[serde(default)]
        node_id: NodeId,
        #[serde(rename = "fullList")]
        #[serde(default)]
        full_list: SinglyLinkedListValue,
    },

    #[serde(rename = "doublyLinkedListNodeValue")]
    #[non_exhaustive]
    DoublyLinkedListNodeValue {
        #[serde(rename = "nodeId")]
        #[serde(default)]
        node_id: NodeId,
        #[serde(rename = "fullList")]
        #[serde(default)]
        full_list: DoublyLinkedListValue,
    },

    #[serde(rename = "undefinedValue")]
    #[non_exhaustive]
    UndefinedValue {},

    #[serde(rename = "nullValue")]
    #[non_exhaustive]
    NullValue {},

    #[serde(rename = "genericValue")]
    #[non_exhaustive]
    GenericValue {
        #[serde(rename = "stringifiedType")]
        #[serde(skip_serializing_if = "Option::is_none")]
        stringified_type: Option<String>,
        #[serde(rename = "stringifiedValue")]
        #[serde(default)]
        stringified_value: String,
    },
}

impl DebugVariableValue {
    pub fn integer_value(value: i64) -> Self {
        Self::IntegerValue { value }
    }

    pub fn boolean_value(value: bool) -> Self {
        Self::BooleanValue { value }
    }

    pub fn double_value(value: f64) -> Self {
        Self::DoubleValue { value }
    }

    pub fn string_value(value: String) -> Self {
        Self::StringValue { value }
    }

    pub fn char_value(value: String) -> Self {
        Self::CharValue { value }
    }

    pub fn map_value(key_value_pairs: Vec<Box<DebugKeyValuePairs>>) -> Self {
        Self::MapValue { key_value_pairs }
    }

    pub fn list_value(value: Vec<Box<DebugVariableValue>>) -> Self {
        Self::ListValue { value }
    }

    pub fn binary_tree_node_value(node_id: NodeId, full_tree: BinaryTreeValue) -> Self {
        Self::BinaryTreeNodeValue { node_id, full_tree }
    }

    pub fn singly_linked_list_node_value(
        node_id: NodeId,
        full_list: SinglyLinkedListValue,
    ) -> Self {
        Self::SinglyLinkedListNodeValue { node_id, full_list }
    }

    pub fn doubly_linked_list_node_value(
        node_id: NodeId,
        full_list: DoublyLinkedListValue,
    ) -> Self {
        Self::DoublyLinkedListNodeValue { node_id, full_list }
    }

    pub fn undefined_value() -> Self {
        Self::UndefinedValue {}
    }

    pub fn null_value() -> Self {
        Self::NullValue {}
    }

    pub fn generic_value(stringified_value: String) -> Self {
        Self::GenericValue {
            stringified_type: None,
            stringified_value,
        }
    }

    pub fn generic_value_with_stringified_type(
        stringified_type: String,
        stringified_value: String,
    ) -> Self {
        Self::GenericValue {
            stringified_type: Some(stringified_type),
            stringified_value,
        }
    }
}
