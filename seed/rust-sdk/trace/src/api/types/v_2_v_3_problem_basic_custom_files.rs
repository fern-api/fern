use crate::commons_language::Language;
use crate::v_2_problem_basic_test_case_template::BasicTestCaseTemplate;
use crate::v_2_problem_files::Files;
use crate::v_2_problem_non_void_function_signature::NonVoidFunctionSignature;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicCustomFiles {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature,
    #[serde(rename = "additionalFiles")]
    pub additional_files: HashMap<Language, Files>,
    #[serde(rename = "basicTestCaseTemplate")]
    pub basic_test_case_template: BasicTestCaseTemplate,
}
