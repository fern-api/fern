use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendEvent {
    #[serde(rename = "sendText")]
    pub send_text: String,
    #[serde(rename = "sendParam")]
    pub send_param: i32,
}