pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bar: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_bar: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_required_bar: Option<String>,
    #[serde(default)]
    pub required_bar: String,
}

impl Foo {
    pub fn builder() -> FooBuilder {
        FooBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FooBuilder {
    bar: Option<String>,
    nullable_bar: Option<String>,
    nullable_required_bar: Option<String>,
    required_bar: Option<String>,
}

impl FooBuilder {
    pub fn bar(mut self, value: impl Into<String>) -> Self {
        self.bar = Some(value.into());
        self
    }

    pub fn nullable_bar(mut self, value: impl Into<String>) -> Self {
        self.nullable_bar = Some(value.into());
        self
    }

    pub fn nullable_required_bar(mut self, value: impl Into<String>) -> Self {
        self.nullable_required_bar = Some(value.into());
        self
    }

    pub fn required_bar(mut self, value: impl Into<String>) -> Self {
        self.required_bar = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Foo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_bar`](FooBuilder::required_bar)
    pub fn build(self) -> Result<Foo, BuildError> {
        Ok(Foo {
            bar: self.bar,
            nullable_bar: self.nullable_bar,
            nullable_required_bar: self.nullable_required_bar,
            required_bar: self
                .required_bar
                .ok_or_else(|| BuildError::missing_field("required_bar"))?,
        })
    }
}
