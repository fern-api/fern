pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemBasicCustomFiles {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: V2V3ProblemNonVoidFunctionSignature,
    #[serde(rename = "additionalFiles")]
    pub additional_files: HashMap<Language, V2V3ProblemFiles>,
    #[serde(rename = "basicTestCaseTemplate")]
    pub basic_test_case_template: V2V3ProblemBasicTestCaseTemplate,
}