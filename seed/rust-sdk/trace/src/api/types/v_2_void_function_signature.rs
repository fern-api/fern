pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2VoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<V2Parameter>,
}

impl V2VoidFunctionSignature {
    pub fn builder() -> V2VoidFunctionSignatureBuilder {
        <V2VoidFunctionSignatureBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2VoidFunctionSignatureBuilder {
    parameters: Option<Vec<V2Parameter>>,
}

impl V2VoidFunctionSignatureBuilder {
    pub fn parameters(mut self, value: Vec<V2Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2VoidFunctionSignature`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](V2VoidFunctionSignatureBuilder::parameters)
    pub fn build(self) -> Result<V2VoidFunctionSignature, BuildError> {
        Ok(V2VoidFunctionSignature {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
        })
    }
}
