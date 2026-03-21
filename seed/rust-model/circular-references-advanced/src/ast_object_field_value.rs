pub use crate::prelude::*;

/// This type allows us to test a circular reference with a union type (see FieldValue).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectFieldValue {
    #[serde(default)]
    pub name: FieldName,
    pub value: FieldValue,
}