use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EchoRequest {
    pub name: String,
    pub size: i32,
}