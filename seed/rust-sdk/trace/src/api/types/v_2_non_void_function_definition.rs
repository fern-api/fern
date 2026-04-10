pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2NonVoidFunctionDefinition {
    pub signature: V2NonVoidFunctionSignature,
    #[serde(default)]
    pub code: V2FunctionImplementationForMultipleLanguages,
}

impl V2NonVoidFunctionDefinition {
    pub fn builder() -> V2NonVoidFunctionDefinitionBuilder {
        <V2NonVoidFunctionDefinitionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2NonVoidFunctionDefinitionBuilder {
    signature: Option<V2NonVoidFunctionSignature>,
    code: Option<V2FunctionImplementationForMultipleLanguages>,
}

impl V2NonVoidFunctionDefinitionBuilder {
    pub fn signature(mut self, value: V2NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn code(mut self, value: V2FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2NonVoidFunctionDefinition`].
    /// This method will fail if any of the following fields are not set:
    /// - [`signature`](V2NonVoidFunctionDefinitionBuilder::signature)
    /// - [`code`](V2NonVoidFunctionDefinitionBuilder::code)
    pub fn build(self) -> Result<V2NonVoidFunctionDefinition, BuildError> {
        Ok(V2NonVoidFunctionDefinition {
            signature: self
                .signature
                .ok_or_else(|| BuildError::missing_field("signature"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
