pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FooResponse {
    #[serde(default)]
    pub bar: String,
}

impl FooResponse {
    pub fn builder() -> FooResponseBuilder {
        FooResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooResponseBuilder {
    bar: Option<String>,
}

impl FooResponseBuilder {
    pub fn bar(mut self, value: impl Into<String>) -> Self {
        self.bar = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FooResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar`](FooResponseBuilder::bar)
    pub fn build(self) -> Result<FooResponse, BuildError> {
        Ok(FooResponse {
            bar: self.bar.ok_or_else(|| BuildError::missing_field("bar"))?,
        })
    }
}
