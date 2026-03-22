pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: TestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: ParameterId,
}

impl BasicTestCaseTemplate {
    pub fn builder() -> BasicTestCaseTemplateBuilder {
        BasicTestCaseTemplateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BasicTestCaseTemplateBuilder {
    template_id: Option<TestCaseTemplateId>,
    name: Option<String>,
    description: Option<TestCaseImplementationDescription>,
    expected_value_parameter_id: Option<ParameterId>,
}

impl BasicTestCaseTemplateBuilder {
    pub fn template_id(mut self, value: TestCaseTemplateId) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn description(mut self, value: TestCaseImplementationDescription) -> Self {
        self.description = Some(value);
        self
    }

    pub fn expected_value_parameter_id(mut self, value: ParameterId) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BasicTestCaseTemplate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](BasicTestCaseTemplateBuilder::template_id)
    /// - [`name`](BasicTestCaseTemplateBuilder::name)
    /// - [`description`](BasicTestCaseTemplateBuilder::description)
    /// - [`expected_value_parameter_id`](BasicTestCaseTemplateBuilder::expected_value_parameter_id)
    pub fn build(self) -> Result<BasicTestCaseTemplate, BuildError> {
        Ok(BasicTestCaseTemplate {
            template_id: self
                .template_id
                .ok_or_else(|| BuildError::missing_field("template_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            description: self
                .description
                .ok_or_else(|| BuildError::missing_field("description"))?,
            expected_value_parameter_id: self
                .expected_value_parameter_id
                .ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
