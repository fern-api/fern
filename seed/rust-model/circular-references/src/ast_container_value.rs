pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AstContainerValue {
        List {
            value: Vec<AstFieldValue>,
        },

        Optional {
            value: Option<AstFieldValue>,
        },
}
