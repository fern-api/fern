pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<Foo2>,
}

impl Foo {
    pub fn builder() -> FooBuilder {
        FooBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooBuilder {
    foo: Option<Foo2>,
}

impl FooBuilder {
    pub fn foo(mut self, value: Foo2) -> Self {
        self.foo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Foo`].
    pub fn build(self) -> Result<Foo, BuildError> {
        Ok(Foo { foo: self.foo })
    }
}
