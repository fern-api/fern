pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseTemplateFileRequest2 {
    pub template: TestCaseTemplate2,
}

impl GetGeneratedTestCaseTemplateFileRequest2 {
    pub fn builder() -> GetGeneratedTestCaseTemplateFileRequest2Builder {
        <GetGeneratedTestCaseTemplateFileRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetGeneratedTestCaseTemplateFileRequest2Builder {
    template: Option<TestCaseTemplate2>,
}

impl GetGeneratedTestCaseTemplateFileRequest2Builder {
    pub fn template(mut self, value: TestCaseTemplate2) -> Self {
        self.template = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetGeneratedTestCaseTemplateFileRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template`](GetGeneratedTestCaseTemplateFileRequest2Builder::template)
    pub fn build(self) -> Result<GetGeneratedTestCaseTemplateFileRequest2, BuildError> {
        Ok(GetGeneratedTestCaseTemplateFileRequest2 {
            template: self
                .template
                .ok_or_else(|| BuildError::missing_field("template"))?,
        })
    }
}
