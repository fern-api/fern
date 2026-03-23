pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MyObject {
    #[serde(default)]
    pub foo: String,
}

impl MyObject {
    pub fn builder() -> MyObjectBuilder {
        MyObjectBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MyObjectBuilder {
    foo: Option<String>,
}

impl MyObjectBuilder {
    pub fn foo(mut self, value: impl Into<String>) -> Self {
        self.foo = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`MyObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo`](MyObjectBuilder::foo)
    pub fn build(self) -> Result<MyObject, BuildError> {
        Ok(MyObject {
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
        })
    }
}
