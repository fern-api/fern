pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ContainerValue {
        #[serde(rename = "list")]
        List {
            value: Vec<Box<FieldValue>>,
        },

        #[serde(rename = "optional")]
        Optional {
            value: Option<Box<FieldValue>>,
        },
}
