pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2AssertCorrectnessCheckZero {
    #[serde(flatten)]
    pub v2deep_equality_correctness_check_fields: V2DeepEqualityCorrectnessCheck,
    pub r#type: V2AssertCorrectnessCheckZeroType,
}

impl V2AssertCorrectnessCheckZero {
    pub fn builder() -> V2AssertCorrectnessCheckZeroBuilder {
        <V2AssertCorrectnessCheckZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2AssertCorrectnessCheckZeroBuilder {
    v2deep_equality_correctness_check_fields: Option<V2DeepEqualityCorrectnessCheck>,
    r#type: Option<V2AssertCorrectnessCheckZeroType>,
}

impl V2AssertCorrectnessCheckZeroBuilder {
    pub fn v2deep_equality_correctness_check_fields(mut self, value: V2DeepEqualityCorrectnessCheck) -> Self {
        self.v2deep_equality_correctness_check_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2AssertCorrectnessCheckZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2AssertCorrectnessCheckZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2deep_equality_correctness_check_fields`](V2AssertCorrectnessCheckZeroBuilder::v2deep_equality_correctness_check_fields)
    /// - [`r#type`](V2AssertCorrectnessCheckZeroBuilder::r#type)
    pub fn build(self) -> Result<V2AssertCorrectnessCheckZero, BuildError> {
        Ok(V2AssertCorrectnessCheckZero {
            v2deep_equality_correctness_check_fields: self.v2deep_equality_correctness_check_fields.ok_or_else(|| BuildError::missing_field("v2deep_equality_correctness_check_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
