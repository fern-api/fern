pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesUserProfile {
    pub user_id: TypesUserID,
    pub email: TypesUserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<TypesUserAge>,
    pub tags: TypesUserTags,
}