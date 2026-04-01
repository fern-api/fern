pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ImportingA {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub a: Option<A>,
}

impl ImportingA {
    pub fn builder() -> ImportingABuilder {
        <ImportingABuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ImportingABuilder {
    a: Option<A>,
}

impl ImportingABuilder {
    pub fn a(mut self, value: A) -> Self {
        self.a = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ImportingA`].
    pub fn build(self) -> Result<ImportingA, BuildError> {
        Ok(ImportingA {
            a: self.a,
        })
    }
}
