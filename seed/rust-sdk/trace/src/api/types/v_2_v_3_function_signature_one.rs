pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3FunctionSignatureOne {
    #[serde(flatten)]
    pub v2v3non_void_function_signature_fields: V2V3NonVoidFunctionSignature,
    pub r#type: V2V3FunctionSignatureOneType,
}

impl V2V3FunctionSignatureOne {
    pub fn builder() -> V2V3FunctionSignatureOneBuilder {
        <V2V3FunctionSignatureOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3FunctionSignatureOneBuilder {
    v2v3non_void_function_signature_fields: Option<V2V3NonVoidFunctionSignature>,
    r#type: Option<V2V3FunctionSignatureOneType>,
}

impl V2V3FunctionSignatureOneBuilder {
    pub fn v2v3non_void_function_signature_fields(
        mut self,
        value: V2V3NonVoidFunctionSignature,
    ) -> Self {
        self.v2v3non_void_function_signature_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3FunctionSignatureOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3FunctionSignatureOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3non_void_function_signature_fields`](V2V3FunctionSignatureOneBuilder::v2v3non_void_function_signature_fields)
    /// - [`r#type`](V2V3FunctionSignatureOneBuilder::r#type)
    pub fn build(self) -> Result<V2V3FunctionSignatureOne, BuildError> {
        Ok(V2V3FunctionSignatureOne {
            v2v3non_void_function_signature_fields: self
                .v2v3non_void_function_signature_fields
                .ok_or_else(|| {
                    BuildError::missing_field("v2v3non_void_function_signature_fields")
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
