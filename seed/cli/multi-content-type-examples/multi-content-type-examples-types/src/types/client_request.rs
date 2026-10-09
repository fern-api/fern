pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ClientRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client: Option<Client>,
}

impl ClientRequest {
    pub fn builder() -> ClientRequestBuilder {
        <ClientRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ClientRequestBuilder {
    client: Option<Client>,
}

impl ClientRequestBuilder {
    pub fn client(mut self, value: Client) -> Self {
        self.client = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ClientRequest`].
    pub fn build(self) -> Result<ClientRequest, BuildError> {
        Ok(ClientRequest {
            client: self.client,
        })
    }
}

