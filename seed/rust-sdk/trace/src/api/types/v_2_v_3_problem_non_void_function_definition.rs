pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition2 {
    pub signature: NonVoidFunctionSignature2,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages2,
}

impl NonVoidFunctionDefinition2 {
    pub fn builder() -> NonVoidFunctionDefinition2Builder {
        NonVoidFunctionDefinition2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NonVoidFunctionDefinition2Builder {
    signature: Option<NonVoidFunctionSignature2>,
    code: Option<FunctionImplementationForMultipleLanguages2>,
}

impl NonVoidFunctionDefinition2Builder {
    pub fn signature(mut self, value: NonVoidFunctionSignature2) -> Self {
        self.signature = Some(value);
        self
    }

    pub fn code(mut self, value: FunctionImplementationForMultipleLanguages2) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NonVoidFunctionDefinition2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`signature`](NonVoidFunctionDefinition2Builder::signature)
    /// - [`code`](NonVoidFunctionDefinition2Builder::code)
    pub fn build(self) -> Result<NonVoidFunctionDefinition2, BuildError> {
        Ok(NonVoidFunctionDefinition2 {
            signature: self.signature.ok_or_else(|| BuildError::missing_field("signature"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
