pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2NonVoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<V2Parameter>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}

impl V2NonVoidFunctionSignature {
    pub fn builder() -> V2NonVoidFunctionSignatureBuilder {
        <V2NonVoidFunctionSignatureBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2NonVoidFunctionSignatureBuilder {
    parameters: Option<Vec<V2Parameter>>,
    return_type: Option<VariableType>,
}

impl V2NonVoidFunctionSignatureBuilder {
    pub fn parameters(mut self, value: Vec<V2Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn return_type(mut self, value: VariableType) -> Self {
        self.return_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2NonVoidFunctionSignature`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](V2NonVoidFunctionSignatureBuilder::parameters)
    /// - [`return_type`](V2NonVoidFunctionSignatureBuilder::return_type)
    pub fn build(self) -> Result<V2NonVoidFunctionSignature, BuildError> {
        Ok(V2NonVoidFunctionSignature {
            parameters: self.parameters.ok_or_else(|| BuildError::missing_field("parameters"))?,
            return_type: self.return_type.ok_or_else(|| BuildError::missing_field("return_type"))?,
        })
    }
}
