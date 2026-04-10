pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3NonVoidFunctionDefinition {
    pub signature: V2V3NonVoidFunctionSignature,
    #[serde(default)]
    pub code: V2V3FunctionImplementationForMultipleLanguages,
}

impl V2V3NonVoidFunctionDefinition {
    pub fn builder() -> V2V3NonVoidFunctionDefinitionBuilder {
        <V2V3NonVoidFunctionDefinitionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3NonVoidFunctionDefinitionBuilder {
    signature: Option<V2V3NonVoidFunctionSignature>,
    code: Option<V2V3FunctionImplementationForMultipleLanguages>,
}

impl V2V3NonVoidFunctionDefinitionBuilder {
    pub fn signature(mut self, value: V2V3NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn code(mut self, value: V2V3FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3NonVoidFunctionDefinition`].
    /// This method will fail if any of the following fields are not set:
    /// - [`signature`](V2V3NonVoidFunctionDefinitionBuilder::signature)
    /// - [`code`](V2V3NonVoidFunctionDefinitionBuilder::code)
    pub fn build(self) -> Result<V2V3NonVoidFunctionDefinition, BuildError> {
        Ok(V2V3NonVoidFunctionDefinition {
            signature: self.signature.ok_or_else(|| BuildError::missing_field("signature"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
