pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionListResponse {
    #[serde(default)]
    pub data: Vec<MyUnion>,
}

impl UnionListResponse {
    pub fn builder() -> UnionListResponseBuilder {
        UnionListResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionListResponseBuilder {
    data: Option<Vec<MyUnion>>,
}

impl UnionListResponseBuilder {
    pub fn data(mut self, value: Vec<MyUnion>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionListResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UnionListResponseBuilder::data)
    pub fn build(self) -> Result<UnionListResponse, BuildError> {
        Ok(UnionListResponse {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
