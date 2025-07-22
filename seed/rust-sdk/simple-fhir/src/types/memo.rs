use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Memo {
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub account: Option<Account>,
}