pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3GeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    #[serde(default)]
    pub generated_test_case_files: HashMap<String, V2V3Files>,
    #[serde(rename = "generatedTemplateFiles")]
    #[serde(default)]
    pub generated_template_files: HashMap<String, V2V3Files>,
    #[serde(default)]
    pub other: HashMap<String, V2V3Files>,
}

impl V2V3GeneratedFiles {
    pub fn builder() -> V2V3GeneratedFilesBuilder {
        <V2V3GeneratedFilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3GeneratedFilesBuilder {
    generated_test_case_files: Option<HashMap<String, V2V3Files>>,
    generated_template_files: Option<HashMap<String, V2V3Files>>,
    other: Option<HashMap<String, V2V3Files>>,
}

impl V2V3GeneratedFilesBuilder {
    pub fn generated_test_case_files(mut self, value: HashMap<String, V2V3Files>) -> Self {
        self.generated_test_case_files = Some(value);
        self
    }

    pub fn generated_template_files(mut self, value: HashMap<String, V2V3Files>) -> Self {
        self.generated_template_files = Some(value);
        self
    }

    pub fn other(mut self, value: HashMap<String, V2V3Files>) -> Self {
        self.other = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3GeneratedFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`generated_test_case_files`](V2V3GeneratedFilesBuilder::generated_test_case_files)
    /// - [`generated_template_files`](V2V3GeneratedFilesBuilder::generated_template_files)
    /// - [`other`](V2V3GeneratedFilesBuilder::other)
    pub fn build(self) -> Result<V2V3GeneratedFiles, BuildError> {
        Ok(V2V3GeneratedFiles {
            generated_test_case_files: self.generated_test_case_files.ok_or_else(|| BuildError::missing_field("generated_test_case_files"))?,
            generated_template_files: self.generated_template_files.ok_or_else(|| BuildError::missing_field("generated_template_files"))?,
            other: self.other.ok_or_else(|| BuildError::missing_field("other"))?,
        })
    }
}
