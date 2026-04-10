pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3AssertCorrectnessCheckOne {
    #[serde(flatten)]
    pub v2v3void_function_definition_that_takes_actual_result_fields:
        V2V3VoidFunctionDefinitionThatTakesActualResult,
    pub r#type: V2V3AssertCorrectnessCheckOneType,
}

impl V2V3AssertCorrectnessCheckOne {
    pub fn builder() -> V2V3AssertCorrectnessCheckOneBuilder {
        <V2V3AssertCorrectnessCheckOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3AssertCorrectnessCheckOneBuilder {
    v2v3void_function_definition_that_takes_actual_result_fields:
        Option<V2V3VoidFunctionDefinitionThatTakesActualResult>,
    r#type: Option<V2V3AssertCorrectnessCheckOneType>,
}

impl V2V3AssertCorrectnessCheckOneBuilder {
    pub fn v2v3void_function_definition_that_takes_actual_result_fields(
        mut self,
        value: V2V3VoidFunctionDefinitionThatTakesActualResult,
    ) -> Self {
        self.v2v3void_function_definition_that_takes_actual_result_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3AssertCorrectnessCheckOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3AssertCorrectnessCheckOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3void_function_definition_that_takes_actual_result_fields`](V2V3AssertCorrectnessCheckOneBuilder::v2v3void_function_definition_that_takes_actual_result_fields)
    /// - [`r#type`](V2V3AssertCorrectnessCheckOneBuilder::r#type)
    pub fn build(self) -> Result<V2V3AssertCorrectnessCheckOne, BuildError> {
        Ok(V2V3AssertCorrectnessCheckOne {
            v2v3void_function_definition_that_takes_actual_result_fields: self
                .v2v3void_function_definition_that_takes_actual_result_fields
                .ok_or_else(|| {
                    BuildError::missing_field(
                        "v2v3void_function_definition_that_takes_actual_result_fields",
                    )
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
