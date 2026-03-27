pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemInfo {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemDescription")]
    #[serde(default)]
    pub problem_description: ProblemDescription,
    #[serde(rename = "problemName")]
    #[serde(default)]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
    #[serde(default)]
    pub files: HashMap<Language, ProblemFiles>,
    #[serde(rename = "inputParams")]
    #[serde(default)]
    pub input_params: Vec<VariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: VariableType,
    #[serde(default)]
    pub testcases: Vec<TestCaseWithExpectedResult>,
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    #[serde(rename = "supportsCustomTestCases")]
    #[serde(default)]
    pub supports_custom_test_cases: bool,
}

impl ProblemInfo {
    pub fn builder() -> ProblemInfoBuilder {
        <ProblemInfoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProblemInfoBuilder {
    problem_id: Option<ProblemId>,
    problem_description: Option<ProblemDescription>,
    problem_name: Option<String>,
    problem_version: Option<i64>,
    files: Option<HashMap<Language, ProblemFiles>>,
    input_params: Option<Vec<VariableTypeAndName>>,
    output_type: Option<VariableType>,
    testcases: Option<Vec<TestCaseWithExpectedResult>>,
    method_name: Option<String>,
    supports_custom_test_cases: Option<bool>,
}

impl ProblemInfoBuilder {
    pub fn problem_id(mut self, value: ProblemId) -> Self {
        self.problem_id = Some(value);
        self
    }

    pub fn problem_description(mut self, value: ProblemDescription) -> Self {
        self.problem_description = Some(value);
        self
    }

    pub fn problem_name(mut self, value: impl Into<String>) -> Self {
        self.problem_name = Some(value.into());
        self
    }

    pub fn problem_version(mut self, value: i64) -> Self {
        self.problem_version = Some(value);
        self
    }

    pub fn files(mut self, value: HashMap<Language, ProblemFiles>) -> Self {
        self.files = Some(value);
        self
    }

    pub fn input_params(mut self, value: Vec<VariableTypeAndName>) -> Self {
        self.input_params = Some(value);
        self
    }

    pub fn output_type(mut self, value: VariableType) -> Self {
        self.output_type = Some(value);
        self
    }

    pub fn testcases(mut self, value: Vec<TestCaseWithExpectedResult>) -> Self {
        self.testcases = Some(value);
        self
    }

    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn supports_custom_test_cases(mut self, value: bool) -> Self {
        self.supports_custom_test_cases = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ProblemInfo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](ProblemInfoBuilder::problem_id)
    /// - [`problem_description`](ProblemInfoBuilder::problem_description)
    /// - [`problem_name`](ProblemInfoBuilder::problem_name)
    /// - [`problem_version`](ProblemInfoBuilder::problem_version)
    /// - [`files`](ProblemInfoBuilder::files)
    /// - [`input_params`](ProblemInfoBuilder::input_params)
    /// - [`output_type`](ProblemInfoBuilder::output_type)
    /// - [`testcases`](ProblemInfoBuilder::testcases)
    /// - [`method_name`](ProblemInfoBuilder::method_name)
    /// - [`supports_custom_test_cases`](ProblemInfoBuilder::supports_custom_test_cases)
    pub fn build(self) -> Result<ProblemInfo, BuildError> {
        Ok(ProblemInfo {
            problem_id: self.problem_id.ok_or_else(|| BuildError::missing_field("problem_id"))?,
            problem_description: self.problem_description.ok_or_else(|| BuildError::missing_field("problem_description"))?,
            problem_name: self.problem_name.ok_or_else(|| BuildError::missing_field("problem_name"))?,
            problem_version: self.problem_version.ok_or_else(|| BuildError::missing_field("problem_version"))?,
            files: self.files.ok_or_else(|| BuildError::missing_field("files"))?,
            input_params: self.input_params.ok_or_else(|| BuildError::missing_field("input_params"))?,
            output_type: self.output_type.ok_or_else(|| BuildError::missing_field("output_type"))?,
            testcases: self.testcases.ok_or_else(|| BuildError::missing_field("testcases"))?,
            method_name: self.method_name.ok_or_else(|| BuildError::missing_field("method_name"))?,
            supports_custom_test_cases: self.supports_custom_test_cases.ok_or_else(|| BuildError::missing_field("supports_custom_test_cases"))?,
        })
    }
}
