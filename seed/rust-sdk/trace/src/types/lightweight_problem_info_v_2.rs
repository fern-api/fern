use crate::problem_id::ProblemId;
use crate::variable_type::VariableType;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LightweightProblemInfoV2 {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    pub problem_version: i32,
    #[serde(rename = "variableTypes")]
    pub variable_types: std::collections::HashSet<VariableType>,
}