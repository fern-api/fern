pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2GeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    #[serde(default)]
    pub generated_test_case_files: HashMap<String, V2Files>,
    #[serde(rename = "generatedTemplateFiles")]
    #[serde(default)]
    pub generated_template_files: HashMap<String, V2Files>,
    #[serde(default)]
    pub other: HashMap<String, V2Files>,
}

impl V2GeneratedFiles {
    pub fn builder() -> V2GeneratedFilesBuilder {
        <V2GeneratedFilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GeneratedFilesBuilder {
    generated_test_case_files: Option<HashMap<String, V2Files>>,
    generated_template_files: Option<HashMap<String, V2Files>>,
    other: Option<HashMap<String, V2Files>>,
}

impl V2GeneratedFilesBuilder {
    pub fn generated_test_case_files(mut self, value: HashMap<String, V2Files>) -> Self {
        self.generated_test_case_files = Some(value);
        self
    }

    pub fn generated_template_files(mut self, value: HashMap<String, V2Files>) -> Self {
        self.generated_template_files = Some(value);
        self
    }

    pub fn other(mut self, value: HashMap<String, V2Files>) -> Self {
        self.other = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GeneratedFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`generated_test_case_files`](V2GeneratedFilesBuilder::generated_test_case_files)
    /// - [`generated_template_files`](V2GeneratedFilesBuilder::generated_template_files)
    /// - [`other`](V2GeneratedFilesBuilder::other)
    pub fn build(self) -> Result<V2GeneratedFiles, BuildError> {
        Ok(V2GeneratedFiles {
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
