pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WrapperWithExtendedEnum {
    pub item: ExtendedWithEnum,
}

impl WrapperWithExtendedEnum {
    pub fn builder() -> WrapperWithExtendedEnumBuilder {
        <WrapperWithExtendedEnumBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WrapperWithExtendedEnumBuilder {
    item: Option<ExtendedWithEnum>,
}

impl WrapperWithExtendedEnumBuilder {
    pub fn item(mut self, value: ExtendedWithEnum) -> Self {
        self.item = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WrapperWithExtendedEnum`].
    /// This method will fail if any of the following fields are not set:
    /// - [`item`](WrapperWithExtendedEnumBuilder::item)
    pub fn build(self) -> Result<WrapperWithExtendedEnum, BuildError> {
        Ok(WrapperWithExtendedEnum {
            item: self.item.ok_or_else(|| BuildError::missing_field("item"))?,
        })
    }
}
