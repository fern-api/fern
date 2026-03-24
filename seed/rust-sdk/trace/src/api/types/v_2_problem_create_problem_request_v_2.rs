pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateProblemRequestV2 {
    #[serde(rename = "problemName")]
    #[serde(default)]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    #[serde(default)]
    pub problem_description: ProblemDescription,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles,
    #[serde(rename = "customTestCaseTemplates")]
    #[serde(default)]
    pub custom_test_case_templates: Vec<TestCaseTemplate>,
    #[serde(default)]
    pub testcases: Vec<TestCaseV2>,
    #[serde(rename = "supportedLanguages")]
    #[serde(default)]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "isPublic")]
    #[serde(default)]
    pub is_public: bool,
}

impl CreateProblemRequestV2 {
    pub fn builder() -> CreateProblemRequestV2Builder {
        CreateProblemRequestV2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateProblemRequestV2Builder {
    problem_name: Option<String>,
    problem_description: Option<ProblemDescription>,
    custom_files: Option<CustomFiles>,
    custom_test_case_templates: Option<Vec<TestCaseTemplate>>,
    testcases: Option<Vec<TestCaseV2>>,
    supported_languages: Option<HashSet<Language>>,
    is_public: Option<bool>,
}

impl CreateProblemRequestV2Builder {
    pub fn problem_name(mut self, value: impl Into<String>) -> Self {
        self.problem_name = Some(value.into());
        self
    }

    pub fn problem_description(mut self, value: ProblemDescription) -> Self {
        self.problem_description = Some(value);
        self
    }

    pub fn custom_files(mut self, value: CustomFiles) -> Self {
        self.custom_files = Some(value);
        self
    }

    pub fn custom_test_case_templates(mut self, value: Vec<TestCaseTemplate>) -> Self {
        self.custom_test_case_templates = Some(value);
        self
    }

    pub fn testcases(mut self, value: Vec<TestCaseV2>) -> Self {
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

    /// Consumes the builder and constructs a [`CreateProblemRequestV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_name`](CreateProblemRequestV2Builder::problem_name)
    /// - [`problem_description`](CreateProblemRequestV2Builder::problem_description)
    /// - [`custom_files`](CreateProblemRequestV2Builder::custom_files)
    /// - [`custom_test_case_templates`](CreateProblemRequestV2Builder::custom_test_case_templates)
    /// - [`testcases`](CreateProblemRequestV2Builder::testcases)
    /// - [`supported_languages`](CreateProblemRequestV2Builder::supported_languages)
    /// - [`is_public`](CreateProblemRequestV2Builder::is_public)
    pub fn build(self) -> Result<CreateProblemRequestV2, BuildError> {
        Ok(CreateProblemRequestV2 {
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
