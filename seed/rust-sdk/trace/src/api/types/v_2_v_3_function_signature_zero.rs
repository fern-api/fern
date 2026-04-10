pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3FunctionSignatureZero {
    #[serde(flatten)]
    pub v2v3void_function_signature_fields: V2V3VoidFunctionSignature,
    pub r#type: V2V3FunctionSignatureZeroType,
}

impl V2V3FunctionSignatureZero {
    pub fn builder() -> V2V3FunctionSignatureZeroBuilder {
        <V2V3FunctionSignatureZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3FunctionSignatureZeroBuilder {
    v2v3void_function_signature_fields: Option<V2V3VoidFunctionSignature>,
    r#type: Option<V2V3FunctionSignatureZeroType>,
}

impl V2V3FunctionSignatureZeroBuilder {
    pub fn v2v3void_function_signature_fields(mut self, value: V2V3VoidFunctionSignature) -> Self {
        self.v2v3void_function_signature_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3FunctionSignatureZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3FunctionSignatureZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3void_function_signature_fields`](V2V3FunctionSignatureZeroBuilder::v2v3void_function_signature_fields)
    /// - [`r#type`](V2V3FunctionSignatureZeroBuilder::r#type)
    pub fn build(self) -> Result<V2V3FunctionSignatureZero, BuildError> {
        Ok(V2V3FunctionSignatureZero {
            v2v3void_function_signature_fields: self
                .v2v3void_function_signature_fields
                .ok_or_else(|| BuildError::missing_field("v2v3void_function_signature_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
