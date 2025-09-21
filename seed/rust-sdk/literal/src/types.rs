use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendResponse {
    pub message: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
    pub success: String, // TODO: Implement proper type
}

pub type SomeAliasedLiteral = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ATopLevelLiteral {
    pub nested_literal: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ANestedLiteral {
    pub my_literal: String, // TODO: Implement proper type
}

pub type AliasToPrompt = String; // TODO: Implement proper type

pub type AliasToStream = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendRequest {
    pub prompt: String, // TODO: Implement proper type
    pub query: String, // TODO: Implement proper type
    pub stream: String, // TODO: Implement proper type
    pub ending: String, // TODO: Implement proper type
    pub context: String, // TODO: Implement proper type
    pub maybe_context: String, // TODO: Implement proper type
    pub container_object: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerObject {
    pub nested_objects: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NestedObjectWithLiterals {
    pub literal_1: String, // TODO: Implement proper type
    pub literal_2: String, // TODO: Implement proper type
    pub str_prop: String, // TODO: Implement proper type
}

pub type SomeLiteral = String; // TODO: Implement proper type

