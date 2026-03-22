pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GeneratedFiles2 {
    #[serde(rename = "generatedTestCaseFiles")]
    #[serde(default)]
    pub generated_test_case_files: HashMap<Language, Files2>,
    #[serde(rename = "generatedTemplateFiles")]
    #[serde(default)]
    pub generated_template_files: HashMap<Language, Files2>,
    #[serde(default)]
    pub other: HashMap<Language, Files2>,
}

impl GeneratedFiles2 {
    pub fn builder() -> GeneratedFiles2Builder {
        GeneratedFiles2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GeneratedFiles2Builder {
    generated_test_case_files: Option<HashMap<Language, Files2>>,
    generated_template_files: Option<HashMap<Language, Files2>>,
    other: Option<HashMap<Language, Files2>>,
}

impl GeneratedFiles2Builder {
    pub fn generated_test_case_files(mut self, value: HashMap<Language, Files2>) -> Self {
        self.generated_test_case_files = Some(value);
        self
    }

    pub fn generated_template_files(mut self, value: HashMap<Language, Files2>) -> Self {
        self.generated_template_files = Some(value);
        self
    }

    pub fn other(mut self, value: HashMap<Language, Files2>) -> Self {
        self.other = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GeneratedFiles2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`generated_test_case_files`](GeneratedFiles2Builder::generated_test_case_files)
    /// - [`generated_template_files`](GeneratedFiles2Builder::generated_template_files)
    /// - [`other`](GeneratedFiles2Builder::other)
    pub fn build(self) -> Result<GeneratedFiles2, BuildError> {
        Ok(GeneratedFiles2 {
            generated_test_case_files: self.generated_test_case_files.ok_or_else(|| BuildError::missing_field("generated_test_case_files"))?,
            generated_template_files: self.generated_template_files.ok_or_else(|| BuildError::missing_field("generated_template_files"))?,
            other: self.other.ok_or_else(|| BuildError::missing_field("other"))?,
        })
    }
}
