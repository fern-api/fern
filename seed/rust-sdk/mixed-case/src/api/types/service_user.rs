pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct User {
    #[serde(rename = "userName")]
    #[serde(default)]
    pub user_name: String,
    #[serde(default)]
    pub metadata_tags: Vec<String>,
    #[serde(rename = "EXTRA_PROPERTIES")]
    #[serde(default)]
    pub extra_properties: HashMap<String, String>,
}
