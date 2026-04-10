pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3FunctionSignatureTwo {
    #[serde(flatten)]
    pub v2v3void_function_signature_that_takes_actual_result_fields: V2V3VoidFunctionSignatureThatTakesActualResult,
    pub r#type: V2V3FunctionSignatureTwoType,
}

impl V2V3FunctionSignatureTwo {
    pub fn builder() -> V2V3FunctionSignatureTwoBuilder {
        <V2V3FunctionSignatureTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3FunctionSignatureTwoBuilder {
    v2v3void_function_signature_that_takes_actual_result_fields: Option<V2V3VoidFunctionSignatureThatTakesActualResult>,
    r#type: Option<V2V3FunctionSignatureTwoType>,
}

impl V2V3FunctionSignatureTwoBuilder {
    pub fn v2v3void_function_signature_that_takes_actual_result_fields(mut self, value: V2V3VoidFunctionSignatureThatTakesActualResult) -> Self {
        self.v2v3void_function_signature_that_takes_actual_result_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3FunctionSignatureTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3FunctionSignatureTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3void_function_signature_that_takes_actual_result_fields`](V2V3FunctionSignatureTwoBuilder::v2v3void_function_signature_that_takes_actual_result_fields)
    /// - [`r#type`](V2V3FunctionSignatureTwoBuilder::r#type)
    pub fn build(self) -> Result<V2V3FunctionSignatureTwo, BuildError> {
        Ok(V2V3FunctionSignatureTwo {
            v2v3void_function_signature_that_takes_actual_result_fields: self.v2v3void_function_signature_that_takes_actual_result_fields.ok_or_else(|| BuildError::missing_field("v2v3void_function_signature_that_takes_actual_result_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
