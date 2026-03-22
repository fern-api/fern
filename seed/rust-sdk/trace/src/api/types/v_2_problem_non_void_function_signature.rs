pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}

impl NonVoidFunctionSignature {
    pub fn builder() -> NonVoidFunctionSignatureBuilder {
        NonVoidFunctionSignatureBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NonVoidFunctionSignatureBuilder {
    parameters: Option<Vec<Parameter>>,
    return_type: Option<VariableType>,
}

impl NonVoidFunctionSignatureBuilder {
    pub fn parameters(mut self, value: Vec<Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn return_type(mut self, value: VariableType) -> Self {
        self.return_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NonVoidFunctionSignature`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](NonVoidFunctionSignatureBuilder::parameters)
    /// - [`return_type`](NonVoidFunctionSignatureBuilder::return_type)
    pub fn build(self) -> Result<NonVoidFunctionSignature, BuildError> {
        Ok(NonVoidFunctionSignature {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            return_type: self
                .return_type
                .ok_or_else(|| BuildError::missing_field("return_type"))?,
        })
    }
}
