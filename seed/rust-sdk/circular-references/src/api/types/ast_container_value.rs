use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ContainerValue {
    List { value: Vec<FieldValue> },

    Optional { value: Option<FieldValue> },
}
