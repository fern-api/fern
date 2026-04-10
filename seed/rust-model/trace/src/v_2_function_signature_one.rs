pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2FunctionSignatureOne {
    #[serde(flatten)]
    pub v2non_void_function_signature_fields: V2NonVoidFunctionSignature,
    pub r#type: V2FunctionSignatureOneType,
}

impl V2FunctionSignatureOne {
    pub fn builder() -> V2FunctionSignatureOneBuilder {
        <V2FunctionSignatureOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2FunctionSignatureOneBuilder {
    v2non_void_function_signature_fields: Option<V2NonVoidFunctionSignature>,
    r#type: Option<V2FunctionSignatureOneType>,
}

impl V2FunctionSignatureOneBuilder {
    pub fn v2non_void_function_signature_fields(mut self, value: V2NonVoidFunctionSignature) -> Self {
        self.v2non_void_function_signature_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2FunctionSignatureOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2FunctionSignatureOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2non_void_function_signature_fields`](V2FunctionSignatureOneBuilder::v2non_void_function_signature_fields)
    /// - [`r#type`](V2FunctionSignatureOneBuilder::r#type)
    pub fn build(self) -> Result<V2FunctionSignatureOne, BuildError> {
        Ok(V2FunctionSignatureOne {
            v2non_void_function_signature_fields: self.v2non_void_function_signature_fields.ok_or_else(|| BuildError::missing_field("v2non_void_function_signature_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
