pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq, Eq, Hash)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct UserProfile {
    #[serde(default)]
    pub user_id: UserID,
    #[serde(default)]
    pub email: UserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(strip_option))]
    pub age: Option<UserAge>,
    #[serde(default)]
    pub tags: UserTags,
}