use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    pub union_: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypeWithOptionalUnion {
    pub my_union: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NamedMetadata {
    pub name: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

pub type OptionalMetadata = String; // TODO: Implement proper type

pub type Metadata = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyType {
    Name,
    Value,
}

