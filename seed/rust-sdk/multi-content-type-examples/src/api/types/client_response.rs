pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ClientResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client: Option<ClientWithId>,
}

impl ClientResponse {
    pub fn builder() -> ClientResponseBuilder {
        <ClientResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ClientResponseBuilder {
    client: Option<ClientWithId>,
}

impl ClientResponseBuilder {
    pub fn client(mut self, value: ClientWithId) -> Self {
        self.client = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ClientResponse`].
    pub fn build(self) -> Result<ClientResponse, BuildError> {
        Ok(ClientResponse {
            client: self.client,
        })
    }
}
