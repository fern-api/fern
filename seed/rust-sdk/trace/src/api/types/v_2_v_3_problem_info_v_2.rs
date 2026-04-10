pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemInfoV2 {
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
    pub supported_languages: Vec<Language>,
    #[serde(rename = "customFiles")]
    pub custom_files: V2V3CustomFiles,
    #[serde(rename = "generatedFiles")]
    #[serde(default)]
    pub generated_files: V2V3GeneratedFiles,
    #[serde(rename = "customTestCaseTemplates")]
    #[serde(default)]
    pub custom_test_case_templates: Vec<V2V3TestCaseTemplate>,
    #[serde(default)]
    pub testcases: Vec<V2V3TestCaseV2>,
    #[serde(rename = "isPublic")]
    #[serde(default)]
    pub is_public: bool,
}

impl V2V3ProblemInfoV2 {
    pub fn builder() -> V2V3ProblemInfoV2Builder {
        <V2V3ProblemInfoV2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3ProblemInfoV2Builder {
    problem_id: Option<ProblemId>,
    problem_description: Option<ProblemDescription>,
    problem_name: Option<String>,
    problem_version: Option<i64>,
    supported_languages: Option<Vec<Language>>,
    custom_files: Option<V2V3CustomFiles>,
    generated_files: Option<V2V3GeneratedFiles>,
    custom_test_case_templates: Option<Vec<V2V3TestCaseTemplate>>,
    testcases: Option<Vec<V2V3TestCaseV2>>,
    is_public: Option<bool>,
}

impl V2V3ProblemInfoV2Builder {
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

    pub fn supported_languages(mut self, value: Vec<Language>) -> Self {
        self.supported_languages = Some(value);
        self
    }

    pub fn custom_files(mut self, value: V2V3CustomFiles) -> Self {
        self.custom_files = Some(value);
        self
    }

    pub fn generated_files(mut self, value: V2V3GeneratedFiles) -> Self {
        self.generated_files = Some(value);
        self
    }

    pub fn custom_test_case_templates(mut self, value: Vec<V2V3TestCaseTemplate>) -> Self {
        self.custom_test_case_templates = Some(value);
        self
    }

    pub fn testcases(mut self, value: Vec<V2V3TestCaseV2>) -> Self {
        self.testcases = Some(value);
        self
    }

    pub fn is_public(mut self, value: bool) -> Self {
        self.is_public = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3ProblemInfoV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](V2V3ProblemInfoV2Builder::problem_id)
    /// - [`problem_description`](V2V3ProblemInfoV2Builder::problem_description)
    /// - [`problem_name`](V2V3ProblemInfoV2Builder::problem_name)
    /// - [`problem_version`](V2V3ProblemInfoV2Builder::problem_version)
    /// - [`supported_languages`](V2V3ProblemInfoV2Builder::supported_languages)
    /// - [`custom_files`](V2V3ProblemInfoV2Builder::custom_files)
    /// - [`generated_files`](V2V3ProblemInfoV2Builder::generated_files)
    /// - [`custom_test_case_templates`](V2V3ProblemInfoV2Builder::custom_test_case_templates)
    /// - [`testcases`](V2V3ProblemInfoV2Builder::testcases)
    /// - [`is_public`](V2V3ProblemInfoV2Builder::is_public)
    pub fn build(self) -> Result<V2V3ProblemInfoV2, BuildError> {
        Ok(V2V3ProblemInfoV2 {
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
