pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BasicCustomFiles2 {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature2,
    #[serde(rename = "additionalFiles")]
    #[serde(default)]
    pub additional_files: HashMap<Language, Files2>,
    #[serde(rename = "basicTestCaseTemplate")]
    #[serde(default)]
    pub basic_test_case_template: BasicTestCaseTemplate2,
}

impl BasicCustomFiles2 {
    pub fn builder() -> BasicCustomFiles2Builder {
        BasicCustomFiles2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BasicCustomFiles2Builder {
    method_name: Option<String>,
    signature: Option<NonVoidFunctionSignature2>,
    additional_files: Option<HashMap<Language, Files2>>,
    basic_test_case_template: Option<BasicTestCaseTemplate2>,
}

impl BasicCustomFiles2Builder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: NonVoidFunctionSignature2) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn additional_files(mut self, value: HashMap<Language, Files2>) -> Self {
        self.additional_files = Some(value);
        self
    }

    pub fn basic_test_case_template(mut self, value: BasicTestCaseTemplate2) -> Self {
        self.basic_test_case_template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BasicCustomFiles2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](BasicCustomFiles2Builder::method_name)
    /// - [`signature`](BasicCustomFiles2Builder::signature)
    /// - [`additional_files`](BasicCustomFiles2Builder::additional_files)
    /// - [`basic_test_case_template`](BasicCustomFiles2Builder::basic_test_case_template)
    pub fn build(self) -> Result<BasicCustomFiles2, BuildError> {
        Ok(BasicCustomFiles2 {
            method_name: self.method_name.ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self.signature.ok_or_else(|| BuildError::missing_field("signature"))?,
            additional_files: self.additional_files.ok_or_else(|| BuildError::missing_field("additional_files"))?,
            basic_test_case_template: self.basic_test_case_template.ok_or_else(|| BuildError::missing_field("basic_test_case_template"))?,
        })
    }
}
