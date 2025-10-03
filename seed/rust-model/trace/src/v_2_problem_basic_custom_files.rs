pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemBasicCustomFiles {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: V2ProblemNonVoidFunctionSignature,
    #[serde(rename = "additionalFiles")]
    pub additional_files: HashMap<Language, V2ProblemFiles>,
    #[serde(rename = "basicTestCaseTemplate")]
    pub basic_test_case_template: V2ProblemBasicTestCaseTemplate,
}