use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ContainerValue {
        List {
            value: Vec<FieldValue>,
        },

        Optional {
            value: Option<FieldValue>,
        },
}
