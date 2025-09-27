use crate::{ApiError, ClientConfig};

pub mod nullable_optional;
pub struct NullableOptionalClient {
    pub config: ClientConfig,
    pub nullable_optional: NullableOptionalClient,
}

impl NullableOptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            nullable_optional: NullableOptionalClient::new(config.clone())?,
        })
    }
}

pub use nullable_optional::*;
