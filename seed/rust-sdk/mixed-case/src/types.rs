use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Organization {
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub user_name: String, // TODO: Implement proper type
    pub metadata_tags: String, // TODO: Implement proper type
    pub extra_properties: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NestedUser {
    pub name: String, // TODO: Implement proper type
    pub nested_user: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResourceStatus {
    Active,
    Inactive,
}

