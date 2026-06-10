pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BaseWithEnum {
    pub status: ExampleStatus,
}

impl BaseWithEnum {
    pub fn builder() -> BaseWithEnumBuilder {
        <BaseWithEnumBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BaseWithEnumBuilder {
    status: Option<ExampleStatus>,
}

impl BaseWithEnumBuilder {
    pub fn status(mut self, value: ExampleStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BaseWithEnum`].
    /// This method will fail if any of the following fields are not set:
    /// - [`status`](BaseWithEnumBuilder::status)
    pub fn build(self) -> Result<BaseWithEnum, BuildError> {
        Ok(BaseWithEnum {
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
