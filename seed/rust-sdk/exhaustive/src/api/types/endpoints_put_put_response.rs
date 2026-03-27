pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PutResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Vec<Error>>,
}

impl PutResponse {
    pub fn builder() -> PutResponseBuilder {
        <PutResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PutResponseBuilder {
    errors: Option<Vec<Error>>,
}

impl PutResponseBuilder {
    pub fn errors(mut self, value: Vec<Error>) -> Self {
        self.errors = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PutResponse`].
    pub fn build(self) -> Result<PutResponse, BuildError> {
        Ok(PutResponse {
            errors: self.errors,
        })
    }
}
