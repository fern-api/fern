pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FooRequest {
    #[serde(default)]
    pub bar: String,
}

impl FooRequest {
    pub fn builder() -> FooRequestBuilder {
        FooRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooRequestBuilder {
    bar: Option<String>,
}

impl FooRequestBuilder {
    pub fn bar(mut self, value: impl Into<String>) -> Self {
        self.bar = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FooRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar`](FooRequestBuilder::bar)
    pub fn build(self) -> Result<FooRequest, BuildError> {
        Ok(FooRequest {
            bar: self.bar.ok_or_else(|| BuildError::missing_field("bar"))?,
        })
    }
}
