use crate::commons_language::Language;
use crate::commons_problem_id::ProblemId;
use crate::commons_test_case_with_expected_result::TestCaseWithExpectedResult;
use crate::commons_variable_type::VariableType;
use crate::problem_problem_description::ProblemDescription;
use crate::problem_problem_files::ProblemFiles;
use crate::problem_variable_type_and_name::VariableTypeAndName;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
