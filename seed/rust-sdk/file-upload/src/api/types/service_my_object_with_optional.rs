pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MyObjectWithOptional {
    #[serde(default)]
    pub prop: String,
    #[serde(rename = "optionalProp")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_prop: Option<String>,
}

impl MyObjectWithOptional {
    pub fn builder() -> MyObjectWithOptionalBuilder {
        <MyObjectWithOptionalBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MyObjectWithOptionalBuilder {
    prop: Option<String>,
    optional_prop: Option<String>,
}

impl MyObjectWithOptionalBuilder {
    pub fn prop(mut self, value: impl Into<String>) -> Self {
        self.prop = Some(value.into());
        self
    }

    pub fn optional_prop(mut self, value: impl Into<String>) -> Self {
        self.optional_prop = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`MyObjectWithOptional`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prop`](MyObjectWithOptionalBuilder::prop)
    pub fn build(self) -> Result<MyObjectWithOptional, BuildError> {
        Ok(MyObjectWithOptional {
            prop: self.prop.ok_or_else(|| BuildError::missing_field("prop"))?,
            optional_prop: self.optional_prop,
        })
    }
}
