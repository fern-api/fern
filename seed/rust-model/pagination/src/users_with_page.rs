pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersWithPage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}