pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Response2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<Foo>,
}

impl Response2 {
    pub fn builder() -> Response2Builder {
        <Response2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Response2Builder {
    foo: Option<Foo>,
}

impl Response2Builder {
    pub fn foo(mut self, value: Foo) -> Self {
        self.foo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Response2`].
    pub fn build(self) -> Result<Response2, BuildError> {
        Ok(Response2 { foo: self.foo })
    }
}
