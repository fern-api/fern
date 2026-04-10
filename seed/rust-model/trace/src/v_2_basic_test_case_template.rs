pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2BasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: V2TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: V2TestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: V2ParameterId,
}

impl V2BasicTestCaseTemplate {
    pub fn builder() -> V2BasicTestCaseTemplateBuilder {
        <V2BasicTestCaseTemplateBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2BasicTestCaseTemplateBuilder {
    template_id: Option<V2TestCaseTemplateId>,
    name: Option<String>,
    description: Option<V2TestCaseImplementationDescription>,
    expected_value_parameter_id: Option<V2ParameterId>,
}

impl V2BasicTestCaseTemplateBuilder {
    pub fn template_id(mut self, value: V2TestCaseTemplateId) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn description(mut self, value: V2TestCaseImplementationDescription) -> Self {
        self.description = Some(value);
        self
    }

    pub fn expected_value_parameter_id(mut self, value: V2ParameterId) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2BasicTestCaseTemplate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](V2BasicTestCaseTemplateBuilder::template_id)
    /// - [`name`](V2BasicTestCaseTemplateBuilder::name)
    /// - [`description`](V2BasicTestCaseTemplateBuilder::description)
    /// - [`expected_value_parameter_id`](V2BasicTestCaseTemplateBuilder::expected_value_parameter_id)
    pub fn build(self) -> Result<V2BasicTestCaseTemplate, BuildError> {
        Ok(V2BasicTestCaseTemplate {
            template_id: self.template_id.ok_or_else(|| BuildError::missing_field("template_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            description: self.description.ok_or_else(|| BuildError::missing_field("description"))?,
            expected_value_parameter_id: self.expected_value_parameter_id.ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
