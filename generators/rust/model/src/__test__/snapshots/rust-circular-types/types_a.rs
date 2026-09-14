pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct A {
    pub kind: Kind,
    #[serde(default)]
    pub children: Vec<Box<B>>,
}

impl A {
    pub fn builder() -> ABuilder {
        <ABuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ABuilder {
    kind: Option<Kind>,
    children: Option<Vec<Box<B>>>,
}

impl ABuilder {
    pub fn kind(mut self, value: Kind) -> Self {
        self.kind = Some(value);
        self
    }

    pub fn children(mut self, value: Vec<Box<B>>) -> Self {
        self.children = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`A`].
    /// This method will fail if any of the following fields are not set:
    /// - [`kind`](ABuilder::kind)
    /// - [`children`](ABuilder::children)
    pub fn build(self) -> Result<A, BuildError> {
        Ok(A {
            kind: self.kind.ok_or_else(|| BuildError::missing_field("kind"))?,
            children: self.children.ok_or_else(|| BuildError::missing_field("children"))?,
        })
    }
}
