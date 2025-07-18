use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EchoRequest {
    pub name: String, // TODO: Implement proper type
    pub size: String, // TODO: Implement proper type
}

