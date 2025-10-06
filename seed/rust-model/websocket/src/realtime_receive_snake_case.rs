pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RealtimeReceiveSnakeCase {
    pub receive_text: String,
    pub receive_int: i64,
}