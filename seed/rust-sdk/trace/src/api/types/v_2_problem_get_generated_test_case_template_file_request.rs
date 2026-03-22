pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseTemplateFileRequest {
    pub template: TestCaseTemplate,
}

impl GetGeneratedTestCaseTemplateFileRequest {
    pub fn builder() -> GetGeneratedTestCaseTemplateFileRequestBuilder {
        GetGeneratedTestCaseTemplateFileRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetGeneratedTestCaseTemplateFileRequestBuilder {
    template: Option<TestCaseTemplate>,
}

impl GetGeneratedTestCaseTemplateFileRequestBuilder {
    pub fn template(mut self, value: TestCaseTemplate) -> Self {
        self.template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetGeneratedTestCaseTemplateFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template`](GetGeneratedTestCaseTemplateFileRequestBuilder::template)
    pub fn build(self) -> Result<GetGeneratedTestCaseTemplateFileRequest, BuildError> {
        Ok(GetGeneratedTestCaseTemplateFileRequest {
            template: self
                .template
                .ok_or_else(|| BuildError::missing_field("template"))?,
        })
    }
}
