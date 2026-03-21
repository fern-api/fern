pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeepEqualityCorrectnessCheck2 {
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: ParameterId2,
}

impl DeepEqualityCorrectnessCheck2 {
    pub fn builder() -> DeepEqualityCorrectnessCheck2Builder {
        DeepEqualityCorrectnessCheck2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeepEqualityCorrectnessCheck2Builder {
    expected_value_parameter_id: Option<ParameterId2>,
}

impl DeepEqualityCorrectnessCheck2Builder {
    pub fn expected_value_parameter_id(mut self, value: ParameterId2) -> Self {
        self.expected_value_parameter_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DeepEqualityCorrectnessCheck2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expected_value_parameter_id`](DeepEqualityCorrectnessCheck2Builder::expected_value_parameter_id)
    pub fn build(self) -> Result<DeepEqualityCorrectnessCheck2, BuildError> {
        Ok(DeepEqualityCorrectnessCheck2 {
            expected_value_parameter_id: self
                .expected_value_parameter_id
                .ok_or_else(|| BuildError::missing_field("expected_value_parameter_id"))?,
        })
    }
}
