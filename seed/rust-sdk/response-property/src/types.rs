use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StringResponse {
    pub data: String, // TODO: Implement proper type
}

pub type OptionalStringResponse = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithMetadata {
    pub metadata: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithDocs {
    pub docs: String, // TODO: Implement proper type
}

pub type OptionalWithDocs = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub data: String, // TODO: Implement proper type
}

