pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2BasicCustomFiles {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: V2NonVoidFunctionSignature,
    #[serde(rename = "additionalFiles")]
    #[serde(default)]
    pub additional_files: HashMap<String, V2Files>,
    #[serde(rename = "basicTestCaseTemplate")]
    #[serde(default)]
    pub basic_test_case_template: V2BasicTestCaseTemplate,
}

impl V2BasicCustomFiles {
    pub fn builder() -> V2BasicCustomFilesBuilder {
        <V2BasicCustomFilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2BasicCustomFilesBuilder {
    method_name: Option<String>,
    signature: Option<V2NonVoidFunctionSignature>,
    additional_files: Option<HashMap<String, V2Files>>,
    basic_test_case_template: Option<V2BasicTestCaseTemplate>,
}

impl V2BasicCustomFilesBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: V2NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn additional_files(mut self, value: HashMap<String, V2Files>) -> Self {
        self.additional_files = Some(value);
        self
    }

    pub fn basic_test_case_template(mut self, value: V2BasicTestCaseTemplate) -> Self {
        self.basic_test_case_template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2BasicCustomFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](V2BasicCustomFilesBuilder::method_name)
    /// - [`signature`](V2BasicCustomFilesBuilder::signature)
    /// - [`additional_files`](V2BasicCustomFilesBuilder::additional_files)
    /// - [`basic_test_case_template`](V2BasicCustomFilesBuilder::basic_test_case_template)
    pub fn build(self) -> Result<V2BasicCustomFiles, BuildError> {
        Ok(V2BasicCustomFiles {
            method_name: self
                .method_name
                .ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self
                .signature
                .ok_or_else(|| BuildError::missing_field("signature"))?,
            additional_files: self
                .additional_files
                .ok_or_else(|| BuildError::missing_field("additional_files"))?,
            basic_test_case_template: self
                .basic_test_case_template
                .ok_or_else(|| BuildError::missing_field("basic_test_case_template"))?,
        })
    }
}
