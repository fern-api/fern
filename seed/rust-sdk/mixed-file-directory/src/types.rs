use serde::{Deserialize, Serialize};

pub type Id = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Organization {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub users: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOrganizationRequest {
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub age: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub id: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

