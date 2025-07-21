use crate::error::Error;
use reqwest::{Client, RequestBuilder};
use serde::{Deserialize, Serialize};

pub struct ExhaustiveClient {
    client: Client,
    base_url: String,
}

impl ExhaustiveClient {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.into(),
        }
    }

    pub fn with_client(client: Client, base_url: impl Into<String>) -> Self {
        Self {
            client,
            base_url: base_url.into(),
        }
    }

    // TODO: Add API methods here
}
