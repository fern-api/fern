use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenResponse {
    pub access_token: String, // TODO: Implement proper type
    pub expires_in: String, // TODO: Implement proper type
    pub refresh_token: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

