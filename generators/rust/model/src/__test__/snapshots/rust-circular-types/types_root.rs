pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Root {
    pub a: A,
    pub c: C,
}

impl Root {
    pub fn builder() -> RootBuilder {
        <RootBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RootBuilder {
    a: Option<A>,
    c: Option<C>,
}

impl RootBuilder {
    pub fn a(mut self, value: A) -> Self {
        self.a = Some(value);
        self
    }

    pub fn c(mut self, value: C) -> Self {
        self.c = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Root`].
    /// This method will fail if any of the following fields are not set:
    /// - [`a`](RootBuilder::a)
    /// - [`c`](RootBuilder::c)
    pub fn build(self) -> Result<Root, BuildError> {
        Ok(Root {
            a: self.a.ok_or_else(|| BuildError::missing_field("a"))?,
            c: self.c.ok_or_else(|| BuildError::missing_field("c"))?,
        })
    }
}
