use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectFieldValue {
    pub name: FieldName,
    pub value: FieldValue,
}