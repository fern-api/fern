pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3BasicCustomFiles {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: V2V3NonVoidFunctionSignature,
    #[serde(rename = "additionalFiles")]
    #[serde(default)]
    pub additional_files: HashMap<String, V2V3Files>,
    #[serde(rename = "basicTestCaseTemplate")]
    #[serde(default)]
    pub basic_test_case_template: V2V3BasicTestCaseTemplate,
}

impl V2V3BasicCustomFiles {
    pub fn builder() -> V2V3BasicCustomFilesBuilder {
        <V2V3BasicCustomFilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3BasicCustomFilesBuilder {
    method_name: Option<String>,
    signature: Option<V2V3NonVoidFunctionSignature>,
    additional_files: Option<HashMap<String, V2V3Files>>,
    basic_test_case_template: Option<V2V3BasicTestCaseTemplate>,
}

impl V2V3BasicCustomFilesBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: V2V3NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn additional_files(mut self, value: HashMap<String, V2V3Files>) -> Self {
        self.additional_files = Some(value);
        self
    }

    pub fn basic_test_case_template(mut self, value: V2V3BasicTestCaseTemplate) -> Self {
        self.basic_test_case_template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3BasicCustomFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](V2V3BasicCustomFilesBuilder::method_name)
    /// - [`signature`](V2V3BasicCustomFilesBuilder::signature)
    /// - [`additional_files`](V2V3BasicCustomFilesBuilder::additional_files)
    /// - [`basic_test_case_template`](V2V3BasicCustomFilesBuilder::basic_test_case_template)
    pub fn build(self) -> Result<V2V3BasicCustomFiles, BuildError> {
        Ok(V2V3BasicCustomFiles {
            method_name: self.method_name.ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self.signature.ok_or_else(|| BuildError::missing_field("signature"))?,
            additional_files: self.additional_files.ok_or_else(|| BuildError::missing_field("additional_files"))?,
            basic_test_case_template: self.basic_test_case_template.ok_or_else(|| BuildError::missing_field("basic_test_case_template"))?,
        })
    }
}
