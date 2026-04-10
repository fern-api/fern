pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3TestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: V2V3TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    pub implementation: V2V3TestCaseImplementation,
}

impl V2V3TestCaseTemplate {
    pub fn builder() -> V2V3TestCaseTemplateBuilder {
        <V2V3TestCaseTemplateBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseTemplateBuilder {
    template_id: Option<V2V3TestCaseTemplateId>,
    name: Option<String>,
    implementation: Option<V2V3TestCaseImplementation>,
}

impl V2V3TestCaseTemplateBuilder {
    pub fn template_id(mut self, value: V2V3TestCaseTemplateId) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn implementation(mut self, value: V2V3TestCaseImplementation) -> Self {
        self.implementation = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseTemplate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](V2V3TestCaseTemplateBuilder::template_id)
    /// - [`name`](V2V3TestCaseTemplateBuilder::name)
    /// - [`implementation`](V2V3TestCaseTemplateBuilder::implementation)
    pub fn build(self) -> Result<V2V3TestCaseTemplate, BuildError> {
        Ok(V2V3TestCaseTemplate {
            template_id: self.template_id.ok_or_else(|| BuildError::missing_field("template_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            implementation: self.implementation.ok_or_else(|| BuildError::missing_field("implementation"))?,
        })
    }
}
