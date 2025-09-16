use crate::ast_field_name::FieldName;
use crate::ast_field_value::FieldValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectFieldValue {
    pub name: FieldName,
    pub value: FieldValue,
}
