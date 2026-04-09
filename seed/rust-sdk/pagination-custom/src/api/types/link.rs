pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Link {
    #[serde(default)]
    pub rel: String,
    #[serde(default)]
    pub method: String,
    #[serde(default)]
    pub href: String,
}

impl Link {
    pub fn builder() -> LinkBuilder {
        <LinkBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LinkBuilder {
    rel: Option<String>,
    method: Option<String>,
    href: Option<String>,
}

impl LinkBuilder {
    pub fn rel(mut self, value: impl Into<String>) -> Self {
        self.rel = Some(value.into());
        self
    }

    pub fn method(mut self, value: impl Into<String>) -> Self {
        self.method = Some(value.into());
        self
    }

    pub fn href(mut self, value: impl Into<String>) -> Self {
        self.href = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Link`].
    /// This method will fail if any of the following fields are not set:
    /// - [`rel`](LinkBuilder::rel)
    /// - [`method`](LinkBuilder::method)
    /// - [`href`](LinkBuilder::href)
    pub fn build(self) -> Result<Link, BuildError> {
        Ok(Link {
            rel: self.rel.ok_or_else(|| BuildError::missing_field("rel"))?,
            method: self
                .method
                .ok_or_else(|| BuildError::missing_field("method"))?,
            href: self.href.ok_or_else(|| BuildError::missing_field("href"))?,
        })
    }
}
