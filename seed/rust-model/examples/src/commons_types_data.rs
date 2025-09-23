use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Data {
        String {
            value: String,
        },

        Base64 {
            value: String,
        },
}
