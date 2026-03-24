pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo {
    #[serde(default)]
    pub normal: String,
    #[serde(default)]
    pub read: String,
    #[serde(default)]
    pub write: String,
}

impl Foo {
    pub fn builder() -> FooBuilder {
        FooBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooBuilder {
    normal: Option<String>,
    read: Option<String>,
    write: Option<String>,
}

impl FooBuilder {
    pub fn normal(mut self, value: impl Into<String>) -> Self {
        self.normal = Some(value.into());
        self
    }

    pub fn read(mut self, value: impl Into<String>) -> Self {
        self.read = Some(value.into());
        self
    }

    pub fn write(mut self, value: impl Into<String>) -> Self {
        self.write = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Foo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`normal`](FooBuilder::normal)
    /// - [`read`](FooBuilder::read)
    /// - [`write`](FooBuilder::write)
    pub fn build(self) -> Result<Foo, BuildError> {
        Ok(Foo {
            normal: self
                .normal
                .ok_or_else(|| BuildError::missing_field("normal"))?,
            read: self.read.ok_or_else(|| BuildError::missing_field("read"))?,
            write: self
                .write
                .ok_or_else(|| BuildError::missing_field("write"))?,
        })
    }
}
