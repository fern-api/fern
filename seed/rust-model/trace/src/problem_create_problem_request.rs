pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemCreateProblemRequest {
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemProblemDescription,
    pub files: HashMap<CommonsLanguage, ProblemProblemFiles>,
    #[serde(rename = "inputParams")]
    pub input_params: Vec<ProblemVariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: CommonsVariableType,
    pub testcases: Vec<CommonsTestCaseWithExpectedResult>,
    #[serde(rename = "methodName")]
    pub method_name: String,
}