pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateProblemRequestV22 {
    #[serde(rename = "problemName")]
    #[serde(default)]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    #[serde(default)]
    pub problem_description: ProblemDescription,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles2,
    #[serde(rename = "customTestCaseTemplates")]
    #[serde(default)]
    pub custom_test_case_templates: Vec<TestCaseTemplate2>,
    #[serde(default)]
    pub testcases: Vec<TestCaseV22>,
    #[serde(rename = "supportedLanguages")]
    #[serde(default)]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "isPublic")]
    #[serde(default)]
    pub is_public: bool,
}

impl CreateProblemRequestV22 {
    pub fn builder() -> CreateProblemRequestV22Builder {
        <CreateProblemRequestV22Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateProblemRequestV22Builder {
    problem_name: Option<String>,
    problem_description: Option<ProblemDescription>,
    custom_files: Option<CustomFiles2>,
    custom_test_case_templates: Option<Vec<TestCaseTemplate2>>,
    testcases: Option<Vec<TestCaseV22>>,
    supported_languages: Option<HashSet<Language>>,
    is_public: Option<bool>,
}

impl CreateProblemRequestV22Builder {
    pub fn problem_name(mut self, value: impl Into<String>) -> Self {
        self.problem_name = Some(value.into());
        self
    }

    pub fn problem_description(mut self, value: ProblemDescription) -> Self {
        self.problem_description = Some(value);
        self
    }

    pub fn custom_files(mut self, value: CustomFiles2) -> Self {
        self.custom_files = Some(value);
        self
    }

    pub fn custom_test_case_templates(mut self, value: Vec<TestCaseTemplate2>) -> Self {
        self.custom_test_case_templates = Some(value);
        self
    }

    pub fn testcases(mut self, value: Vec<TestCaseV22>) -> Self {
        self.testcases = Some(value);
        self
    }

    pub fn supported_languages(mut self, value: HashSet<Language>) -> Self {
        self.supported_languages = Some(value);
        self
    }

    pub fn is_public(mut self, value: bool) -> Self {
        self.is_public = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateProblemRequestV22`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_name`](CreateProblemRequestV22Builder::problem_name)
    /// - [`problem_description`](CreateProblemRequestV22Builder::problem_description)
    /// - [`custom_files`](CreateProblemRequestV22Builder::custom_files)
    /// - [`custom_test_case_templates`](CreateProblemRequestV22Builder::custom_test_case_templates)
    /// - [`testcases`](CreateProblemRequestV22Builder::testcases)
    /// - [`supported_languages`](CreateProblemRequestV22Builder::supported_languages)
    /// - [`is_public`](CreateProblemRequestV22Builder::is_public)
    pub fn build(self) -> Result<CreateProblemRequestV22, BuildError> {
        Ok(CreateProblemRequestV22 {
            problem_name: self
                .problem_name
                .ok_or_else(|| BuildError::missing_field("problem_name"))?,
            problem_description: self
                .problem_description
                .ok_or_else(|| BuildError::missing_field("problem_description"))?,
            custom_files: self
                .custom_files
                .ok_or_else(|| BuildError::missing_field("custom_files"))?,
            custom_test_case_templates: self
                .custom_test_case_templates
                .ok_or_else(|| BuildError::missing_field("custom_test_case_templates"))?,
            testcases: self
                .testcases
                .ok_or_else(|| BuildError::missing_field("testcases"))?,
            supported_languages: self
                .supported_languages
                .ok_or_else(|| BuildError::missing_field("supported_languages"))?,
            is_public: self
                .is_public
                .ok_or_else(|| BuildError::missing_field("is_public"))?,
        })
    }
}
