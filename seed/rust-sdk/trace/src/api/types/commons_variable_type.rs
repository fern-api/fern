pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum VariableType {
        #[serde(rename = "integerType")]
        #[non_exhaustive]
        IntegerType {},

        #[serde(rename = "doubleType")]
        #[non_exhaustive]
        DoubleType {},

        #[serde(rename = "booleanType")]
        #[non_exhaustive]
        BooleanType {},

        #[serde(rename = "stringType")]
        #[non_exhaustive]
        StringType {},

        #[serde(rename = "charType")]
        #[non_exhaustive]
        CharType {},

        #[serde(rename = "listType")]
        #[non_exhaustive]
        ListType {
            #[serde(rename = "valueType")]
            value_type: Box<VariableType>,
            #[serde(rename = "isFixedLength")]
            #[serde(skip_serializing_if = "Option::is_none")]
            is_fixed_length: Option<bool>,
        },

        #[serde(rename = "mapType")]
        #[non_exhaustive]
        MapType {
            #[serde(rename = "keyType")]
            key_type: Box<VariableType>,
            #[serde(rename = "valueType")]
            value_type: Box<VariableType>,
        },

        #[serde(rename = "binaryTreeType")]
        #[non_exhaustive]
        BinaryTreeType {},

        #[serde(rename = "singlyLinkedListType")]
        #[non_exhaustive]
        SinglyLinkedListType {},

        #[serde(rename = "doublyLinkedListType")]
        #[non_exhaustive]
        DoublyLinkedListType {},
}

impl VariableType {
    pub fn integer_type() -> Self {
        Self::IntegerType {}
    }

    pub fn double_type() -> Self {
        Self::DoubleType {}
    }

    pub fn boolean_type() -> Self {
        Self::BooleanType {}
    }

    pub fn string_type() -> Self {
        Self::StringType {}
    }

    pub fn char_type() -> Self {
        Self::CharType {}
    }

    pub fn list_type(value_type: Box<VariableType>) -> Self {
        Self::ListType { value_type, is_fixed_length: None }
    }

    pub fn map_type(key_type: Box<VariableType>, value_type: Box<VariableType>) -> Self {
        Self::MapType { key_type, value_type }
    }

    pub fn binary_tree_type() -> Self {
        Self::BinaryTreeType {}
    }

    pub fn singly_linked_list_type() -> Self {
        Self::SinglyLinkedListType {}
    }

    pub fn doubly_linked_list_type() -> Self {
        Self::DoublyLinkedListType {}
    }
}
