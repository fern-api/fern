pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3GetGeneratedTestCaseTemplateFileRequest {
    pub template: V2V3TestCaseTemplate,
}

impl V2V3GetGeneratedTestCaseTemplateFileRequest {
    pub fn builder() -> V2V3GetGeneratedTestCaseTemplateFileRequestBuilder {
        <V2V3GetGeneratedTestCaseTemplateFileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3GetGeneratedTestCaseTemplateFileRequestBuilder {
    template: Option<V2V3TestCaseTemplate>,
}

impl V2V3GetGeneratedTestCaseTemplateFileRequestBuilder {
    pub fn template(mut self, value: V2V3TestCaseTemplate) -> Self {
        self.template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3GetGeneratedTestCaseTemplateFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template`](V2V3GetGeneratedTestCaseTemplateFileRequestBuilder::template)
    pub fn build(self) -> Result<V2V3GetGeneratedTestCaseTemplateFileRequest, BuildError> {
        Ok(V2V3GetGeneratedTestCaseTemplateFileRequest {
            template: self.template.ok_or_else(|| BuildError::missing_field("template"))?,
        })
    }
}
