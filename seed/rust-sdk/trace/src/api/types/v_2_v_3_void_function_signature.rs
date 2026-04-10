pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3VoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<V2V3Parameter>,
}

impl V2V3VoidFunctionSignature {
    pub fn builder() -> V2V3VoidFunctionSignatureBuilder {
        <V2V3VoidFunctionSignatureBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3VoidFunctionSignatureBuilder {
    parameters: Option<Vec<V2V3Parameter>>,
}

impl V2V3VoidFunctionSignatureBuilder {
    pub fn parameters(mut self, value: Vec<V2V3Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3VoidFunctionSignature`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](V2V3VoidFunctionSignatureBuilder::parameters)
    pub fn build(self) -> Result<V2V3VoidFunctionSignature, BuildError> {
        Ok(V2V3VoidFunctionSignature {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
        })
    }
}
