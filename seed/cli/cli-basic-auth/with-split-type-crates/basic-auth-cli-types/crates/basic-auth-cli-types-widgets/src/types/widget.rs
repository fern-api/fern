pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Widget {
    #[serde(default)]
    pub id: String,
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
    id: Option<String>,
    name: Option<String>,
}

impl WidgetBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Widget`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](WidgetBuilder::id)
    /// - [`name`](WidgetBuilder::name)
    pub fn build(self) -> Result<Widget, BuildError> {
        Ok(Widget {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
