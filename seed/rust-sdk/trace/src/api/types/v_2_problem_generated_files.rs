pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    #[serde(default)]
    pub generated_test_case_files: HashMap<Language, Files>,
    #[serde(rename = "generatedTemplateFiles")]
    #[serde(default)]
    pub generated_template_files: HashMap<Language, Files>,
    #[serde(default)]
    pub other: HashMap<Language, Files>,
}

impl GeneratedFiles {
    pub fn builder() -> GeneratedFilesBuilder {
        GeneratedFilesBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GeneratedFilesBuilder {
    generated_test_case_files: Option<HashMap<Language, Files>>,
    generated_template_files: Option<HashMap<Language, Files>>,
    other: Option<HashMap<Language, Files>>,
}

impl GeneratedFilesBuilder {
    pub fn generated_test_case_files(mut self, value: HashMap<Language, Files>) -> Self {
        self.generated_test_case_files = Some(value);
        self
    }

    pub fn generated_template_files(mut self, value: HashMap<Language, Files>) -> Self {
        self.generated_template_files = Some(value);
        self
    }

    pub fn other(mut self, value: HashMap<Language, Files>) -> Self {
        self.other = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GeneratedFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`generated_test_case_files`](GeneratedFilesBuilder::generated_test_case_files)
    /// - [`generated_template_files`](GeneratedFilesBuilder::generated_template_files)
    /// - [`other`](GeneratedFilesBuilder::other)
    pub fn build(self) -> Result<GeneratedFiles, BuildError> {
        Ok(GeneratedFiles {
            generated_test_case_files: self
                .generated_test_case_files
                .ok_or_else(|| BuildError::missing_field("generated_test_case_files"))?,
            generated_template_files: self
                .generated_template_files
                .ok_or_else(|| BuildError::missing_field("generated_template_files"))?,
            other: self
                .other
                .ok_or_else(|| BuildError::missing_field("other"))?,
        })
    }
}
