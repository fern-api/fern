pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    pub implementation: TestCaseImplementation,
}

impl TestCaseTemplate {
    pub fn builder() -> TestCaseTemplateBuilder {
        <TestCaseTemplateBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseTemplateBuilder {
    template_id: Option<TestCaseTemplateId>,
    name: Option<String>,
    implementation: Option<TestCaseImplementation>,
}

impl TestCaseTemplateBuilder {
    pub fn template_id(mut self, value: TestCaseTemplateId) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn implementation(mut self, value: TestCaseImplementation) -> Self {
        self.implementation = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseTemplate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](TestCaseTemplateBuilder::template_id)
    /// - [`name`](TestCaseTemplateBuilder::name)
    /// - [`implementation`](TestCaseTemplateBuilder::implementation)
    pub fn build(self) -> Result<TestCaseTemplate, BuildError> {
        Ok(TestCaseTemplate {
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
