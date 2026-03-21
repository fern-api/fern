pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
}

impl VoidFunctionSignature {
    pub fn builder() -> VoidFunctionSignatureBuilder {
        VoidFunctionSignatureBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionSignatureBuilder {
    parameters: Option<Vec<Parameter>>,
}

impl VoidFunctionSignatureBuilder {
    pub fn parameters(mut self, value: Vec<Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionSignature`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](VoidFunctionSignatureBuilder::parameters)
    pub fn build(self) -> Result<VoidFunctionSignature, BuildError> {
        Ok(VoidFunctionSignature {
            parameters: self.parameters.ok_or_else(|| BuildError::missing_field("parameters"))?,
        })
    }
}
