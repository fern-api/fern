pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2GetGeneratedTestCaseTemplateFileRequest {
    pub template: V2TestCaseTemplate,
}

impl V2GetGeneratedTestCaseTemplateFileRequest {
    pub fn builder() -> V2GetGeneratedTestCaseTemplateFileRequestBuilder {
        <V2GetGeneratedTestCaseTemplateFileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GetGeneratedTestCaseTemplateFileRequestBuilder {
    template: Option<V2TestCaseTemplate>,
}

impl V2GetGeneratedTestCaseTemplateFileRequestBuilder {
    pub fn template(mut self, value: V2TestCaseTemplate) -> Self {
        self.template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GetGeneratedTestCaseTemplateFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template`](V2GetGeneratedTestCaseTemplateFileRequestBuilder::template)
    pub fn build(self) -> Result<V2GetGeneratedTestCaseTemplateFileRequest, BuildError> {
        Ok(V2GetGeneratedTestCaseTemplateFileRequest {
            template: self.template.ok_or_else(|| BuildError::missing_field("template"))?,
        })
    }
}
