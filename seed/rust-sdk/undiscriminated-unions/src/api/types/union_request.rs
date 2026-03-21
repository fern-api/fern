pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Request {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub union: Option<MetadataUnion>,
}

impl Request {
    pub fn builder() -> RequestBuilder {
        RequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RequestBuilder {
    union: Option<MetadataUnion>,
}

impl RequestBuilder {
    pub fn union(mut self, value: MetadataUnion) -> Self {
        self.union = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Request`].
    pub fn build(self) -> Result<Request, BuildError> {
        Ok(Request { union: self.union })
    }
}
