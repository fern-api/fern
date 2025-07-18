use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Package {
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Record {
    pub foo: String, // TODO: Implement proper type
    pub _3_d: String, // TODO: Implement proper type
}

