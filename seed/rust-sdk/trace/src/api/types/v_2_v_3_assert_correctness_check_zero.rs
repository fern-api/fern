pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2V3AssertCorrectnessCheckZero {
    #[serde(flatten)]
    pub v2v3deep_equality_correctness_check_fields: V2V3DeepEqualityCorrectnessCheck,
    pub r#type: V2V3AssertCorrectnessCheckZeroType,
}

impl V2V3AssertCorrectnessCheckZero {
    pub fn builder() -> V2V3AssertCorrectnessCheckZeroBuilder {
        <V2V3AssertCorrectnessCheckZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3AssertCorrectnessCheckZeroBuilder {
    v2v3deep_equality_correctness_check_fields: Option<V2V3DeepEqualityCorrectnessCheck>,
    r#type: Option<V2V3AssertCorrectnessCheckZeroType>,
}

impl V2V3AssertCorrectnessCheckZeroBuilder {
    pub fn v2v3deep_equality_correctness_check_fields(
        mut self,
        value: V2V3DeepEqualityCorrectnessCheck,
    ) -> Self {
        self.v2v3deep_equality_correctness_check_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3AssertCorrectnessCheckZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3AssertCorrectnessCheckZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3deep_equality_correctness_check_fields`](V2V3AssertCorrectnessCheckZeroBuilder::v2v3deep_equality_correctness_check_fields)
    /// - [`r#type`](V2V3AssertCorrectnessCheckZeroBuilder::r#type)
    pub fn build(self) -> Result<V2V3AssertCorrectnessCheckZero, BuildError> {
        Ok(V2V3AssertCorrectnessCheckZero {
            v2v3deep_equality_correctness_check_fields: self
                .v2v3deep_equality_correctness_check_fields
                .ok_or_else(|| {
                    BuildError::missing_field("v2v3deep_equality_correctness_check_fields")
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
