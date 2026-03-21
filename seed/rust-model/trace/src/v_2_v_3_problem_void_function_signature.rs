pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionSignature2 {
    #[serde(default)]
    pub parameters: Vec<Parameter2>,
}

impl VoidFunctionSignature2 {
    pub fn builder() -> VoidFunctionSignature2Builder {
        VoidFunctionSignature2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionSignature2Builder {
    parameters: Option<Vec<Parameter2>>,
}

impl VoidFunctionSignature2Builder {
    pub fn parameters(mut self, value: Vec<Parameter2>) -> Self {
        self.parameters = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionSignature2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](VoidFunctionSignature2Builder::parameters)
    pub fn build(self) -> Result<VoidFunctionSignature2, BuildError> {
        Ok(VoidFunctionSignature2 {
            parameters: self.parameters.ok_or_else(|| BuildError::missing_field("parameters"))?,
        })
    }
}
