pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo2 {
    #[serde(default)]
    pub bar_property: Uuid,
}

impl Foo2 {
    pub fn builder() -> Foo2Builder {
        <Foo2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Foo2Builder {
    bar_property: Option<Uuid>,
}

impl Foo2Builder {
    pub fn bar_property(mut self, value: Uuid) -> Self {
        self.bar_property = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Foo2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar_property`](Foo2Builder::bar_property)
    pub fn build(self) -> Result<Foo2, BuildError> {
        Ok(Foo2 {
            bar_property: self.bar_property.ok_or_else(|| BuildError::missing_field("bar_property"))?,
        })
    }
}
