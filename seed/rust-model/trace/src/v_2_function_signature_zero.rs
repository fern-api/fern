pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2FunctionSignatureZero {
    #[serde(flatten)]
    pub v2void_function_signature_fields: V2VoidFunctionSignature,
    pub r#type: V2FunctionSignatureZeroType,
}

impl V2FunctionSignatureZero {
    pub fn builder() -> V2FunctionSignatureZeroBuilder {
        <V2FunctionSignatureZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2FunctionSignatureZeroBuilder {
    v2void_function_signature_fields: Option<V2VoidFunctionSignature>,
    r#type: Option<V2FunctionSignatureZeroType>,
}

impl V2FunctionSignatureZeroBuilder {
    pub fn v2void_function_signature_fields(mut self, value: V2VoidFunctionSignature) -> Self {
        self.v2void_function_signature_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2FunctionSignatureZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2FunctionSignatureZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2void_function_signature_fields`](V2FunctionSignatureZeroBuilder::v2void_function_signature_fields)
    /// - [`r#type`](V2FunctionSignatureZeroBuilder::r#type)
    pub fn build(self) -> Result<V2FunctionSignatureZero, BuildError> {
        Ok(V2FunctionSignatureZero {
            v2void_function_signature_fields: self.v2void_function_signature_fields.ok_or_else(|| BuildError::missing_field("v2void_function_signature_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
