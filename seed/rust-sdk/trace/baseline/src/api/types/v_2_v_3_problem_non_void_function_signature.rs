pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionSignature2 {
    #[serde(default)]
    pub parameters: Vec<Parameter2>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}

impl NonVoidFunctionSignature2 {
    pub fn builder() -> NonVoidFunctionSignature2Builder {
        <NonVoidFunctionSignature2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NonVoidFunctionSignature2Builder {
    parameters: Option<Vec<Parameter2>>,
    return_type: Option<VariableType>,
}

impl NonVoidFunctionSignature2Builder {
    pub fn parameters(mut self, value: Vec<Parameter2>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn return_type(mut self, value: VariableType) -> Self {
        self.return_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NonVoidFunctionSignature2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](NonVoidFunctionSignature2Builder::parameters)
    /// - [`return_type`](NonVoidFunctionSignature2Builder::return_type)
    pub fn build(self) -> Result<NonVoidFunctionSignature2, BuildError> {
        Ok(NonVoidFunctionSignature2 {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            return_type: self
                .return_type
                .ok_or_else(|| BuildError::missing_field("return_type"))?,
        })
    }
}
