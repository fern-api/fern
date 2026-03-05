pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserCreatedPayload {
    #[serde(rename = "userId")]
    pub user_id: String,
    pub email: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}
