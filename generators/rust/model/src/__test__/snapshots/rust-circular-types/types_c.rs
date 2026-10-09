pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct C {
    pub b: B,
}

impl C {
    pub fn builder() -> CBuilder {
        <CBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CBuilder {
    b: Option<B>,
}

impl CBuilder {
    pub fn b(mut self, value: B) -> Self {
        self.b = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`C`].
    /// This method will fail if any of the following fields are not set:
    /// - [`b`](CBuilder::b)
    pub fn build(self) -> Result<C, BuildError> {
        Ok(C {
            b: self.b.ok_or_else(|| BuildError::missing_field("b"))?,
        })
    }
}
