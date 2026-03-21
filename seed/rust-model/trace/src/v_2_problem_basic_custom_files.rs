pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BasicCustomFiles {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature,
    #[serde(rename = "additionalFiles")]
    #[serde(default)]
    pub additional_files: HashMap<Language, Files>,
    #[serde(rename = "basicTestCaseTemplate")]
    #[serde(default)]
    pub basic_test_case_template: BasicTestCaseTemplate,
}

impl BasicCustomFiles {
    pub fn builder() -> BasicCustomFilesBuilder {
        BasicCustomFilesBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BasicCustomFilesBuilder {
    method_name: Option<String>,
    signature: Option<NonVoidFunctionSignature>,
    additional_files: Option<HashMap<Language, Files>>,
    basic_test_case_template: Option<BasicTestCaseTemplate>,
}

impl BasicCustomFilesBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn additional_files(mut self, value: HashMap<Language, Files>) -> Self {
        self.additional_files = Some(value);
        self
    }

    pub fn basic_test_case_template(mut self, value: BasicTestCaseTemplate) -> Self {
        self.basic_test_case_template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BasicCustomFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](BasicCustomFilesBuilder::method_name)
    /// - [`signature`](BasicCustomFilesBuilder::signature)
    /// - [`additional_files`](BasicCustomFilesBuilder::additional_files)
    /// - [`basic_test_case_template`](BasicCustomFilesBuilder::basic_test_case_template)
    pub fn build(self) -> Result<BasicCustomFiles, BuildError> {
        Ok(BasicCustomFiles {
            method_name: self.method_name.ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self.signature.ok_or_else(|| BuildError::missing_field("signature"))?,
            additional_files: self.additional_files.ok_or_else(|| BuildError::missing_field("additional_files"))?,
            basic_test_case_template: self.basic_test_case_template.ok_or_else(|| BuildError::missing_field("basic_test_case_template"))?,
        })
    }
}
