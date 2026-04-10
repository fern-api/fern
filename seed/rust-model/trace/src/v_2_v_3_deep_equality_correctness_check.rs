pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2V3DeepEqualityCorrectnessCheck {
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: V2V3ParameterId,
}

impl V2V3DeepEqualityCorrectnessCheck {
    pub fn builder() -> V2V3DeepEqualityCorrectnessCheckBuilder {
        <V2V3DeepEqualityCorrectnessCheckBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3DeepEqualityCorrectnessCheckBuilder {
    expected_value_parameter_id: Option<V2V3ParameterId>,
}

impl V2V3DeepEqualityCorrectnessCheckBuilder {
    pub fn expected_value_parameter_id(mut self, value: V2V3ParameterId) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3DeepEqualityCorrectnessCheck`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expected_value_parameter_id`](V2V3DeepEqualityCorrectnessCheckBuilder::expected_value_parameter_id)
    pub fn build(self) -> Result<V2V3DeepEqualityCorrectnessCheck, BuildError> {
        Ok(V2V3DeepEqualityCorrectnessCheck {
            expected_value_parameter_id: self.expected_value_parameter_id.ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
