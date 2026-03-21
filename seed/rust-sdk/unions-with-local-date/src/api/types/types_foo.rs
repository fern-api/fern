pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo {
    #[serde(default)]
    pub name: String,
}

impl Foo {
    pub fn builder() -> FooBuilder {
        FooBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooBuilder {
    name: Option<String>,
}

impl FooBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Foo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](FooBuilder::name)
    pub fn build(self) -> Result<Foo, BuildError> {
        Ok(Foo {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
