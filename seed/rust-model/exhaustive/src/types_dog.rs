pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TypesDog {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "likesToWoof")]
    #[serde(default)]
    pub likes_to_woof: bool,
}

impl TypesDog {
    pub fn builder() -> TypesDogBuilder {
        <TypesDogBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesDogBuilder {
    name: Option<String>,
    likes_to_woof: Option<bool>,
}

impl TypesDogBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn likes_to_woof(mut self, value: bool) -> Self {
        self.likes_to_woof = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesDog`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](TypesDogBuilder::name)
    /// - [`likes_to_woof`](TypesDogBuilder::likes_to_woof)
    pub fn build(self) -> Result<TypesDog, BuildError> {
        Ok(TypesDog {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            likes_to_woof: self.likes_to_woof.ok_or_else(|| BuildError::missing_field("likes_to_woof"))?,
        })
    }
}
