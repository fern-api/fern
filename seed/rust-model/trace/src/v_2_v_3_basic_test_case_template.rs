pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3BasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: V2V3TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: V2V3TestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: V2V3ParameterId,
}

impl V2V3BasicTestCaseTemplate {
    pub fn builder() -> V2V3BasicTestCaseTemplateBuilder {
        <V2V3BasicTestCaseTemplateBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3BasicTestCaseTemplateBuilder {
    template_id: Option<V2V3TestCaseTemplateId>,
    name: Option<String>,
    description: Option<V2V3TestCaseImplementationDescription>,
    expected_value_parameter_id: Option<V2V3ParameterId>,
}

impl V2V3BasicTestCaseTemplateBuilder {
    pub fn template_id(mut self, value: V2V3TestCaseTemplateId) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn description(mut self, value: V2V3TestCaseImplementationDescription) -> Self {
        self.description = Some(value);
        self
    }

    pub fn expected_value_parameter_id(mut self, value: V2V3ParameterId) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3BasicTestCaseTemplate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](V2V3BasicTestCaseTemplateBuilder::template_id)
    /// - [`name`](V2V3BasicTestCaseTemplateBuilder::name)
    /// - [`description`](V2V3BasicTestCaseTemplateBuilder::description)
    /// - [`expected_value_parameter_id`](V2V3BasicTestCaseTemplateBuilder::expected_value_parameter_id)
    pub fn build(self) -> Result<V2V3BasicTestCaseTemplate, BuildError> {
        Ok(V2V3BasicTestCaseTemplate {
            template_id: self.template_id.ok_or_else(|| BuildError::missing_field("template_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            description: self.description.ok_or_else(|| BuildError::missing_field("description"))?,
            expected_value_parameter_id: self.expected_value_parameter_id.ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
