use crate::problem_id::ProblemId;
use crate::problem_description::ProblemDescription;
use crate::language::Language;
use crate::problem_files::ProblemFiles;
use crate::variable_type_and_name::VariableTypeAndName;
use crate::variable_type::VariableType;
use crate::test_case_with_expected_result::TestCaseWithExpectedResult;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemInfo {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemDescription,
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    pub problem_version: i32,
    pub files: HashMap<Language, ProblemFiles>,
    #[serde(rename = "inputParams")]
    pub input_params: Vec<VariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: VariableType,
    pub testcases: Vec<TestCaseWithExpectedResult>,
    #[serde(rename = "methodName")]
    pub method_name: String,
    #[serde(rename = "supportsCustomTestCases")]
    pub supports_custom_test_cases: bool,
}