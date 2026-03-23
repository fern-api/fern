pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionResponse {
    pub data: MyUnion,
}

impl UnionResponse {
    pub fn builder() -> UnionResponseBuilder {
        UnionResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionResponseBuilder {
    data: Option<MyUnion>,
}

impl UnionResponseBuilder {
    pub fn data(mut self, value: MyUnion) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UnionResponseBuilder::data)
    pub fn build(self) -> Result<UnionResponse, BuildError> {
        Ok(UnionResponse {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
