use crate::some_literal::SomeLiteral;
use crate::container_object::ContainerObject;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SendRequest {
    pub prompt: String,
    pub query: String,
    pub stream: bool,
    pub ending: String,
    pub context: SomeLiteral,
    #[serde(rename = "maybeContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_context: Option<SomeLiteral>,
    #[serde(rename = "containerObject")]
    pub container_object: ContainerObject,
}