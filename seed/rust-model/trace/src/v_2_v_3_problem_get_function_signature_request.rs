use crate::v_2_problem_function_signature::FunctionSignature;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetFunctionSignatureRequest {
    #[serde(rename = "functionSignature")]
    pub function_signature: FunctionSignature,
}