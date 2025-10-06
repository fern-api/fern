pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemProblemInfo {
    #[serde(rename = "problemId")]
    pub problem_id: CommonsProblemId,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemProblemDescription,
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
    pub files: HashMap<CommonsLanguage, ProblemProblemFiles>,
    #[serde(rename = "inputParams")]
    pub input_params: Vec<ProblemVariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: CommonsVariableType,
    pub testcases: Vec<CommonsTestCaseWithExpectedResult>,
    #[serde(rename = "methodName")]
    pub method_name: String,
    #[serde(rename = "supportsCustomTestCases")]
    pub supports_custom_test_cases: bool,
}