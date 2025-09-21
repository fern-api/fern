use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memo {
    pub description: String, // TODO: Implement proper type
    pub account: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaseResource {
    pub id: String, // TODO: Implement proper type
    pub related_resources: String, // TODO: Implement proper type
    pub memo: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub resource_type: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub patient: String, // TODO: Implement proper type
    pub practitioner: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Patient {
    pub resource_type: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub scripts: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Practitioner {
    pub resource_type: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Script {
    pub resource_type: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

