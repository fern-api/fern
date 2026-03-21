pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum VariableValue {
        #[serde(rename = "integerValue")]
        #[non_exhaustive]
        IntegerValue {
            value: i64,
        },

        #[serde(rename = "booleanValue")]
        #[non_exhaustive]
        BooleanValue {
            value: bool,
        },

        #[serde(rename = "doubleValue")]
        #[non_exhaustive]
        DoubleValue {
            value: f64,
        },

        #[serde(rename = "stringValue")]
        #[non_exhaustive]
        StringValue {
            value: String,
        },

        #[serde(rename = "charValue")]
        #[non_exhaustive]
        CharValue {
            value: String,
        },

        #[serde(rename = "mapValue")]
        #[non_exhaustive]
        MapValue {
            #[serde(rename = "keyValuePairs")]
            #[serde(default)]
            key_value_pairs: Vec<Box<KeyValuePair>>,
        },

        #[serde(rename = "listValue")]
        #[non_exhaustive]
        ListValue {
            value: Vec<Box<VariableValue>>,
        },

        #[serde(rename = "binaryTreeValue")]
        #[non_exhaustive]
        BinaryTreeValue {
            #[serde(flatten)]
            data: BinaryTreeValue,
        },

        #[serde(rename = "singlyLinkedListValue")]
        #[non_exhaustive]
        SinglyLinkedListValue {
            #[serde(flatten)]
            data: SinglyLinkedListValue,
        },

        #[serde(rename = "doublyLinkedListValue")]
        #[non_exhaustive]
        DoublyLinkedListValue {
            #[serde(flatten)]
            data: DoublyLinkedListValue,
        },

        #[serde(rename = "nullValue")]
        #[non_exhaustive]
        NullValue {},
}

impl VariableValue {
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

    pub fn map_value(key_value_pairs: Vec<Box<KeyValuePair>>) -> Self {
        Self::MapValue { key_value_pairs }
    }

    pub fn list_value(value: Vec<Box<VariableValue>>) -> Self {
        Self::ListValue { value }
    }

    pub fn binary_tree_value(data: BinaryTreeValue) -> Self {
        Self::BinaryTreeValue { data }
    }

    pub fn singly_linked_list_value(data: SinglyLinkedListValue) -> Self {
        Self::SinglyLinkedListValue { data }
    }

    pub fn doubly_linked_list_value(data: DoublyLinkedListValue) -> Self {
        Self::DoublyLinkedListValue { data }
    }

    pub fn null_value() -> Self {
        Self::NullValue {}
    }
}
