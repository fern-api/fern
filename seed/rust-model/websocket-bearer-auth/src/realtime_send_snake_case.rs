pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RealtimeSendSnakeCase {
    pub send_text: String,
    pub send_param: i64,
}