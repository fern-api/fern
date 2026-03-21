pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FooExtended {
    #[serde(flatten)]
    pub foo_fields: Foo,
    #[serde(default)]
    pub age: i64,
}

impl FooExtended {
    pub fn builder() -> FooExtendedBuilder {
        FooExtendedBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooExtendedBuilder {
    foo_fields: Option<Foo>,
    age: Option<i64>,
}

impl FooExtendedBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FooExtended`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](FooExtendedBuilder::foo_fields)
    /// - [`age`](FooExtendedBuilder::age)
    pub fn build(self) -> Result<FooExtended, BuildError> {
        Ok(FooExtended {
            foo_fields: self.foo_fields.ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            age: self.age.ok_or_else(|| BuildError::missing_field("age"))?,
        })
    }
}
