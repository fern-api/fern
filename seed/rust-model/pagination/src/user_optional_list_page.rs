use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserOptionalListPage {
    pub data: UserOptionalListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<uuid::Uuid>,
}