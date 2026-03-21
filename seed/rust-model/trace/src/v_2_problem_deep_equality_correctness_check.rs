pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeepEqualityCorrectnessCheck {
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: ParameterId,
}

impl DeepEqualityCorrectnessCheck {
    pub fn builder() -> DeepEqualityCorrectnessCheckBuilder {
        DeepEqualityCorrectnessCheckBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeepEqualityCorrectnessCheckBuilder {
    expected_value_parameter_id: Option<ParameterId>,
}

impl DeepEqualityCorrectnessCheckBuilder {
    pub fn expected_value_parameter_id(mut self, value: ParameterId) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DeepEqualityCorrectnessCheck`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expected_value_parameter_id`](DeepEqualityCorrectnessCheckBuilder::expected_value_parameter_id)
    pub fn build(self) -> Result<DeepEqualityCorrectnessCheck, BuildError> {
        Ok(DeepEqualityCorrectnessCheck {
            expected_value_parameter_id: self.expected_value_parameter_id.ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
