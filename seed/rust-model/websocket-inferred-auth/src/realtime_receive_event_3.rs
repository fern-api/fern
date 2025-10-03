pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ReceiveEvent3 {
    #[serde(rename = "receiveText3")]
    pub receive_text_3: String,
}
