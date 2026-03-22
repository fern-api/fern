pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Bird {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub can_fly: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wing_span: Option<f64>,
}

impl Bird {
    pub fn builder() -> BirdBuilder {
        BirdBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BirdBuilder {
    name: Option<String>,
    can_fly: Option<bool>,
    wing_span: Option<f64>,
}

impl BirdBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn can_fly(mut self, value: bool) -> Self {
        self.can_fly = Some(value);
        self
    }

    pub fn wing_span(mut self, value: f64) -> Self {
        self.wing_span = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Bird`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](BirdBuilder::name)
    /// - [`can_fly`](BirdBuilder::can_fly)
    pub fn build(self) -> Result<Bird, BuildError> {
        Ok(Bird {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            can_fly: self.can_fly.ok_or_else(|| BuildError::missing_field("can_fly"))?,
            wing_span: self.wing_span,
        })
    }
}
