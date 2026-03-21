pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BasicTestCaseTemplate2 {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId2,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: TestCaseImplementationDescription2,
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: ParameterId2,
}

impl BasicTestCaseTemplate2 {
    pub fn builder() -> BasicTestCaseTemplate2Builder {
        BasicTestCaseTemplate2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BasicTestCaseTemplate2Builder {
    template_id: Option<TestCaseTemplateId2>,
    name: Option<String>,
    description: Option<TestCaseImplementationDescription2>,
    expected_value_parameter_id: Option<ParameterId2>,
}

impl BasicTestCaseTemplate2Builder {
    pub fn template_id(mut self, value: TestCaseTemplateId2) -> Self {
        self.template_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn description(mut self, value: TestCaseImplementationDescription2) -> Self {
        self.description = Some(value);
        self
    }

    pub fn expected_value_parameter_id(mut self, value: ParameterId2) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BasicTestCaseTemplate2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`template_id`](BasicTestCaseTemplate2Builder::template_id)
    /// - [`name`](BasicTestCaseTemplate2Builder::name)
    /// - [`description`](BasicTestCaseTemplate2Builder::description)
    /// - [`expected_value_parameter_id`](BasicTestCaseTemplate2Builder::expected_value_parameter_id)
    pub fn build(self) -> Result<BasicTestCaseTemplate2, BuildError> {
        Ok(BasicTestCaseTemplate2 {
            template_id: self.template_id.ok_or_else(|| BuildError::missing_field("template_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            description: self.description.ok_or_else(|| BuildError::missing_field("description"))?,
            expected_value_parameter_id: self.expected_value_parameter_id.ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
