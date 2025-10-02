use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Data {
        String {
            value: String,
        },

        Base64 {
            value: String,
        },
}
