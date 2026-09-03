pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct B {
    pub parent: Box<A>,
}

impl B {
    pub fn builder() -> BBuilder {
        <BBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BBuilder {
    parent: Option<Box<A>>,
}

impl BBuilder {
    pub fn parent(mut self, value: Box<A>) -> Self {
        self.parent = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`B`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parent`](BBuilder::parent)
    pub fn build(self) -> Result<B, BuildError> {
        Ok(B {
            parent: self.parent.ok_or_else(|| BuildError::missing_field("parent"))?,
        })
    }
}
