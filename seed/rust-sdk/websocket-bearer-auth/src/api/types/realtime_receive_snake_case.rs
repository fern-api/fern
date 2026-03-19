pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveSnakeCase {
    #[serde(default)]
    pub receive_text: String,
    #[serde(default)]
    pub receive_int: i64,
}
