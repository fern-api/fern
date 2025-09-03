use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendSnakeCase {
    pub send_text: String,
    pub send_param: i32,
}