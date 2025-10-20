pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BasicCustomFiles2 {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature2,
    #[serde(rename = "additionalFiles")]
    pub additional_files: HashMap<Language, Files2>,
    #[serde(rename = "basicTestCaseTemplate")]
    pub basic_test_case_template: BasicTestCaseTemplate2,
}