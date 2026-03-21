pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendEvent {
    #[serde(rename = "sendText")]
    #[serde(default)]
    pub send_text: String,
    #[serde(rename = "sendParam")]
    #[serde(default)]
    pub send_param: i64,
}
