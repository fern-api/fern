pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Response2 {
    #[serde(default)]
    pub foo: String,
}

impl Response2 {
    pub fn builder() -> Response2Builder {
        Response2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Response2Builder {
    foo: Option<String>,
}

impl Response2Builder {
    pub fn foo(mut self, value: impl Into<String>) -> Self {
        self.foo = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Response2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo`](Response2Builder::foo)
    pub fn build(self) -> Result<Response2, BuildError> {
        Ok(Response2 {
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
        })
    }
}
