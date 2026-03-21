pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TerminatedResponse {
}

impl TerminatedResponse {
    pub fn builder() -> TerminatedResponseBuilder {
        TerminatedResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TerminatedResponseBuilder {
}

impl TerminatedResponseBuilder {

    /// Consumes the builder and constructs a [`TerminatedResponse`].
    pub fn build(self) -> Result<TerminatedResponse, BuildError> {
        Ok(TerminatedResponse {
        })
    }
}
