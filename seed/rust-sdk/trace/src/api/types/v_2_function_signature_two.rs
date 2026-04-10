pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2FunctionSignatureTwo {
    #[serde(flatten)]
    pub v2void_function_signature_that_takes_actual_result_fields:
        V2VoidFunctionSignatureThatTakesActualResult,
    pub r#type: V2FunctionSignatureTwoType,
}

impl V2FunctionSignatureTwo {
    pub fn builder() -> V2FunctionSignatureTwoBuilder {
        <V2FunctionSignatureTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2FunctionSignatureTwoBuilder {
    v2void_function_signature_that_takes_actual_result_fields:
        Option<V2VoidFunctionSignatureThatTakesActualResult>,
    r#type: Option<V2FunctionSignatureTwoType>,
}

impl V2FunctionSignatureTwoBuilder {
    pub fn v2void_function_signature_that_takes_actual_result_fields(
        mut self,
        value: V2VoidFunctionSignatureThatTakesActualResult,
    ) -> Self {
        self.v2void_function_signature_that_takes_actual_result_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2FunctionSignatureTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2FunctionSignatureTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2void_function_signature_that_takes_actual_result_fields`](V2FunctionSignatureTwoBuilder::v2void_function_signature_that_takes_actual_result_fields)
    /// - [`r#type`](V2FunctionSignatureTwoBuilder::r#type)
    pub fn build(self) -> Result<V2FunctionSignatureTwo, BuildError> {
        Ok(V2FunctionSignatureTwo {
            v2void_function_signature_that_takes_actual_result_fields: self
                .v2void_function_signature_that_takes_actual_result_fields
                .ok_or_else(|| {
                    BuildError::missing_field(
                        "v2void_function_signature_that_takes_actual_result_fields",
                    )
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
