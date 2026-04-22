pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MyInlineType {
    #[serde(default)]
    pub bar: String,
}

impl MyInlineType {
    pub fn builder() -> MyInlineTypeBuilder {
        <MyInlineTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MyInlineTypeBuilder {
    bar: Option<String>,
}

impl MyInlineTypeBuilder {
    pub fn bar(mut self, value: impl Into<String>) -> Self {
        self.bar = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`MyInlineType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar`](MyInlineTypeBuilder::bar)
    pub fn build(self) -> Result<MyInlineType, BuildError> {
        Ok(MyInlineType {
            bar: self.bar.ok_or_else(|| BuildError::missing_field("bar"))?,
        })
    }
}
