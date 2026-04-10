pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsPutResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Vec<EndpointsError>>,
}

impl EndpointsPutResponse {
    pub fn builder() -> EndpointsPutResponseBuilder {
        <EndpointsPutResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsPutResponseBuilder {
    errors: Option<Vec<EndpointsError>>,
}

impl EndpointsPutResponseBuilder {
    pub fn errors(mut self, value: Vec<EndpointsError>) -> Self {
        self.errors = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EndpointsPutResponse`].
    pub fn build(self) -> Result<EndpointsPutResponse, BuildError> {
        Ok(EndpointsPutResponse {
            errors: self.errors,
        })
    }
}
