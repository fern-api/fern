pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2AssertCorrectnessCheckOne {
    #[serde(flatten)]
    pub v2void_function_definition_that_takes_actual_result_fields:
        V2VoidFunctionDefinitionThatTakesActualResult,
    pub r#type: V2AssertCorrectnessCheckOneType,
}

impl V2AssertCorrectnessCheckOne {
    pub fn builder() -> V2AssertCorrectnessCheckOneBuilder {
        <V2AssertCorrectnessCheckOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2AssertCorrectnessCheckOneBuilder {
    v2void_function_definition_that_takes_actual_result_fields:
        Option<V2VoidFunctionDefinitionThatTakesActualResult>,
    r#type: Option<V2AssertCorrectnessCheckOneType>,
}

impl V2AssertCorrectnessCheckOneBuilder {
    pub fn v2void_function_definition_that_takes_actual_result_fields(
        mut self,
        value: V2VoidFunctionDefinitionThatTakesActualResult,
    ) -> Self {
        self.v2void_function_definition_that_takes_actual_result_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2AssertCorrectnessCheckOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2AssertCorrectnessCheckOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2void_function_definition_that_takes_actual_result_fields`](V2AssertCorrectnessCheckOneBuilder::v2void_function_definition_that_takes_actual_result_fields)
    /// - [`r#type`](V2AssertCorrectnessCheckOneBuilder::r#type)
    pub fn build(self) -> Result<V2AssertCorrectnessCheckOne, BuildError> {
        Ok(V2AssertCorrectnessCheckOne {
            v2void_function_definition_that_takes_actual_result_fields: self
                .v2void_function_definition_that_takes_actual_result_fields
                .ok_or_else(|| {
                    BuildError::missing_field(
                        "v2void_function_definition_that_takes_actual_result_fields",
                    )
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
