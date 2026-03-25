pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TypeWithSingleCharPropertyEqualToTypeStartingLetter {
    #[serde(default)]
    pub t: String,
    #[serde(default)]
    pub ty: String,
}

impl TypeWithSingleCharPropertyEqualToTypeStartingLetter {
    pub fn builder() -> TypeWithSingleCharPropertyEqualToTypeStartingLetterBuilder {
        TypeWithSingleCharPropertyEqualToTypeStartingLetterBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeWithSingleCharPropertyEqualToTypeStartingLetterBuilder {
    t: Option<String>,
    ty: Option<String>,
}

impl TypeWithSingleCharPropertyEqualToTypeStartingLetterBuilder {
    pub fn t(mut self, value: impl Into<String>) -> Self {
        self.t = Some(value.into());
        self
    }

    pub fn ty(mut self, value: impl Into<String>) -> Self {
        self.ty = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TypeWithSingleCharPropertyEqualToTypeStartingLetter`].
    /// This method will fail if any of the following fields are not set:
    /// - [`t`](TypeWithSingleCharPropertyEqualToTypeStartingLetterBuilder::t)
    /// - [`ty`](TypeWithSingleCharPropertyEqualToTypeStartingLetterBuilder::ty)
    pub fn build(self) -> Result<TypeWithSingleCharPropertyEqualToTypeStartingLetter, BuildError> {
        Ok(TypeWithSingleCharPropertyEqualToTypeStartingLetter {
            t: self.t.ok_or_else(|| BuildError::missing_field("t"))?,
            ty: self.ty.ok_or_else(|| BuildError::missing_field("ty"))?,
        })
    }
}
