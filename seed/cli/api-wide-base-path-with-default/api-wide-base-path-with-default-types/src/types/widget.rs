pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Widget {
    #[serde(default)]
    pub name: String,
}

impl Widget {
    pub fn builder() -> WidgetBuilder {
        <WidgetBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WidgetBuilder {
    name: Option<String>,
}

impl WidgetBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Widget`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](WidgetBuilder::name)
    pub fn build(self) -> Result<Widget, BuildError> {
        Ok(Widget {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
