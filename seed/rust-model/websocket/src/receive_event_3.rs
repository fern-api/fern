use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ReceiveEvent3 {
    #[serde(rename = "receiveText3")]
    pub receive_text_3: String,
}