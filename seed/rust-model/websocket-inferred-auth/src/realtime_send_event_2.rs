pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendEvent2 {
    #[serde(rename = "sendText2")]
    #[serde(default)]
    pub send_text_2: String,
    #[serde(rename = "sendParam2")]
    #[serde(default)]
    pub send_param_2: bool,
}