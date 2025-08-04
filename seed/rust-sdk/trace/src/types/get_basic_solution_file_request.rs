use crate::non_void_function_signature::NonVoidFunctionSignature;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileRequest {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature,
}