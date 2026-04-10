pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2DeepEqualityCorrectnessCheck {
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: V2ParameterId,
}

impl V2DeepEqualityCorrectnessCheck {
    pub fn builder() -> V2DeepEqualityCorrectnessCheckBuilder {
        <V2DeepEqualityCorrectnessCheckBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2DeepEqualityCorrectnessCheckBuilder {
    expected_value_parameter_id: Option<V2ParameterId>,
}

impl V2DeepEqualityCorrectnessCheckBuilder {
    pub fn expected_value_parameter_id(mut self, value: V2ParameterId) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2DeepEqualityCorrectnessCheck`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expected_value_parameter_id`](V2DeepEqualityCorrectnessCheckBuilder::expected_value_parameter_id)
    pub fn build(self) -> Result<V2DeepEqualityCorrectnessCheck, BuildError> {
        Ok(V2DeepEqualityCorrectnessCheck {
            expected_value_parameter_id: self.expected_value_parameter_id.ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
