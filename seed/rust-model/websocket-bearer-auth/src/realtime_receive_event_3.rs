pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent3 {
    #[serde(rename = "receiveText3")]
    #[serde(default)]
    pub receive_text_3: String,
}