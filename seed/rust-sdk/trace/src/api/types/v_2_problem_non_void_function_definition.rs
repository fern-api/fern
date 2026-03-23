pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition {
    pub signature: NonVoidFunctionSignature,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages,
}

impl NonVoidFunctionDefinition {
    pub fn builder() -> NonVoidFunctionDefinitionBuilder {
        NonVoidFunctionDefinitionBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NonVoidFunctionDefinitionBuilder {
    signature: Option<NonVoidFunctionSignature>,
    code: Option<FunctionImplementationForMultipleLanguages>,
}

impl NonVoidFunctionDefinitionBuilder {
    pub fn signature(mut self, value: NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn code(mut self, value: FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NonVoidFunctionDefinition`].
    /// This method will fail if any of the following fields are not set:
    /// - [`signature`](NonVoidFunctionDefinitionBuilder::signature)
    /// - [`code`](NonVoidFunctionDefinitionBuilder::code)
    pub fn build(self) -> Result<NonVoidFunctionDefinition, BuildError> {
        Ok(NonVoidFunctionDefinition {
            signature: self
                .signature
                .ok_or_else(|| BuildError::missing_field("signature"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
