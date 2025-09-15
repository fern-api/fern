use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ReceiveSnakeCase {
    pub receive_text: String,
    pub receive_int: i32,
}