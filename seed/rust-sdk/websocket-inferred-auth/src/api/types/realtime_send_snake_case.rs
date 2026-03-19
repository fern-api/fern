pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendSnakeCase {
    #[serde(default)]
    pub send_text: String,
    #[serde(default)]
    pub send_param: i64,
}
