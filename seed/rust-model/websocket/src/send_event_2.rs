use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SendEvent2 {
    #[serde(rename = "sendText2")]
    pub send_text_2: String,
    #[serde(rename = "sendParam2")]
    pub send_param_2: bool,
}