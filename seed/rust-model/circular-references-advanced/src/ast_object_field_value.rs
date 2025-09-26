use crate::ast_field_name::FieldName;
use crate::ast_field_value::FieldValue;
use serde::{Deserialize, Serialize};

/// This type allows us to test a circular reference with a union type (see FieldValue).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectFieldValue {
    pub name: FieldName,
    pub value: FieldValue,
}