pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemInfoV22 {
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
    #[serde(rename = "supportedLanguages")]
    #[serde(default)]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles2,
    #[serde(rename = "generatedFiles")]
    #[serde(default)]
    pub generated_files: GeneratedFiles2,
    #[serde(rename = "customTestCaseTemplates")]
    #[serde(default)]
    pub custom_test_case_templates: Vec<TestCaseTemplate2>,
    #[serde(default)]
    pub testcases: Vec<TestCaseV22>,
    #[serde(rename = "isPublic")]
    #[serde(default)]
    pub is_public: bool,
}

impl ProblemInfoV22 {
    pub fn builder() -> ProblemInfoV22Builder {
        ProblemInfoV22Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProblemInfoV22Builder {
    problem_id: Option<ProblemId>,
    problem_description: Option<ProblemDescription>,
    problem_name: Option<String>,
    problem_version: Option<i64>,
    supported_languages: Option<HashSet<Language>>,
    custom_files: Option<CustomFiles2>,
    generated_files: Option<GeneratedFiles2>,
    custom_test_case_templates: Option<Vec<TestCaseTemplate2>>,
    testcases: Option<Vec<TestCaseV22>>,
    is_public: Option<bool>,
}

impl ProblemInfoV22Builder {
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

    pub fn supported_languages(mut self, value: HashSet<Language>) -> Self {
        self.supported_languages = Some(value);
        self
    }

    pub fn custom_files(mut self, value: CustomFiles2) -> Self {
        self.custom_files = Some(value);
        self
    }

    pub fn generated_files(mut self, value: GeneratedFiles2) -> Self {
        self.generated_files = Some(value);
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

    pub fn is_public(mut self, value: bool) -> Self {
        self.is_public = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ProblemInfoV22`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](ProblemInfoV22Builder::problem_id)
    /// - [`problem_description`](ProblemInfoV22Builder::problem_description)
    /// - [`problem_name`](ProblemInfoV22Builder::problem_name)
    /// - [`problem_version`](ProblemInfoV22Builder::problem_version)
    /// - [`supported_languages`](ProblemInfoV22Builder::supported_languages)
    /// - [`custom_files`](ProblemInfoV22Builder::custom_files)
    /// - [`generated_files`](ProblemInfoV22Builder::generated_files)
    /// - [`custom_test_case_templates`](ProblemInfoV22Builder::custom_test_case_templates)
    /// - [`testcases`](ProblemInfoV22Builder::testcases)
    /// - [`is_public`](ProblemInfoV22Builder::is_public)
    pub fn build(self) -> Result<ProblemInfoV22, BuildError> {
        Ok(ProblemInfoV22 {
            problem_id: self
                .problem_id
                .ok_or_else(|| BuildError::missing_field("problem_id"))?,
            problem_description: self
                .problem_description
                .ok_or_else(|| BuildError::missing_field("problem_description"))?,
            problem_name: self
                .problem_name
                .ok_or_else(|| BuildError::missing_field("problem_name"))?,
            problem_version: self
                .problem_version
                .ok_or_else(|| BuildError::missing_field("problem_version"))?,
            supported_languages: self
                .supported_languages
                .ok_or_else(|| BuildError::missing_field("supported_languages"))?,
            custom_files: self
                .custom_files
                .ok_or_else(|| BuildError::missing_field("custom_files"))?,
            generated_files: self
                .generated_files
                .ok_or_else(|| BuildError::missing_field("generated_files"))?,
            custom_test_case_templates: self
                .custom_test_case_templates
                .ok_or_else(|| BuildError::missing_field("custom_test_case_templates"))?,
            testcases: self
                .testcases
                .ok_or_else(|| BuildError::missing_field("testcases"))?,
            is_public: self
                .is_public
                .ok_or_else(|| BuildError::missing_field("is_public"))?,
        })
    }
}
