pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate2 {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId2,
    #[serde(default)]
    pub name: String,
    pub implementation: TestCaseImplementation2,
}

impl TestCaseTemplate2 {
    pub fn builder() -> TestCaseTemplate2Builder {
        <TestCaseTemplate2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseTemplate2Builder {
    template_id: Option<TestCaseTemplateId2>,
    name: Option<String>,
    implementation: Option<TestCaseImplementation2>,
}

impl TestCaseTemplate2Builder {
    pub fn template_id(mut self, value: TestCaseTemplateId2) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn implementation(mut self, value: TestCaseImplementation2) -> Self {
        self.implementation = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseTemplate2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](TestCaseTemplate2Builder::template_id)
    /// - [`name`](TestCaseTemplate2Builder::name)
    /// - [`implementation`](TestCaseTemplate2Builder::implementation)
    pub fn build(self) -> Result<TestCaseTemplate2, BuildError> {
        Ok(TestCaseTemplate2 {
            template_id: self
                .template_id
                .ok_or_else(|| BuildError::missing_field("template_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            implementation: self
                .implementation
                .ok_or_else(|| BuildError::missing_field("implementation"))?,
        })
    }
}
