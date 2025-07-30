use crate::field_name::FieldName;
use crate::field_value::FieldValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectFieldValue {
    pub name: FieldName,
    pub value: FieldValue,
}