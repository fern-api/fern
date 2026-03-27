pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Response {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<Foo>,
}

impl Response {
    pub fn builder() -> ResponseBuilder {
        <ResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResponseBuilder {
    foo: Option<Foo>,
}

impl ResponseBuilder {
    pub fn foo(mut self, value: Foo) -> Self {
        self.foo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Response`].
    pub fn build(self) -> Result<Response, BuildError> {
        Ok(Response {
            foo: self.foo,
        })
    }
}
