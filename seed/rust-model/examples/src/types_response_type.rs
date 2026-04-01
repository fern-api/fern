pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ResponseType {
    pub r#type: Type,
}

impl ResponseType {
    pub fn builder() -> ResponseTypeBuilder {
        <ResponseTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResponseTypeBuilder {
    r#type: Option<Type>,
}

impl ResponseTypeBuilder {
    pub fn r#type(mut self, value: Type) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ResponseType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](ResponseTypeBuilder::r#type)
    pub fn build(self) -> Result<ResponseType, BuildError> {
        Ok(ResponseType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
