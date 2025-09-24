use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GenerateRequest {
    pub stream: bool,
    pub num_events: i32,
}