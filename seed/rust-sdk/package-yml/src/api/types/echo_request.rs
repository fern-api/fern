pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EchoRequest {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub size: i64,
}

impl EchoRequest {
    pub fn builder() -> EchoRequestBuilder {
        <EchoRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EchoRequestBuilder {
    name: Option<String>,
    size: Option<i64>,
}

impl EchoRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn size(mut self, value: i64) -> Self {
        self.size = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EchoRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](EchoRequestBuilder::name)
    /// - [`size`](EchoRequestBuilder::size)
    pub fn build(self) -> Result<EchoRequest, BuildError> {
        Ok(EchoRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            size: self.size.ok_or_else(|| BuildError::missing_field("size"))?,
        })
    }
}
