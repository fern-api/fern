use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct User {
    #[serde(rename = "userName")]
    pub user_name: String,
    pub metadata_tags: Vec<String>,
    #[serde(rename = "EXTRA_PROPERTIES")]
    pub extra_properties: HashMap<String, String>,
}