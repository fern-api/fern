pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithContentTypeRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(default)]
    pub foo: String,
    #[serde(default)]
    pub bar: MyObject,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo_bar: Option<MyObject>,
}
impl WithContentTypeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    form = form.part(
        "file",
        reqwest::multipart::Part::bytes(self.file.clone())
            .file_name("file")
            .mime_str("application/octet-stream").unwrap()
    );

    if let Ok(json_str) = serde_json::to_string(&self.foo) {
        form = form.text("foo", json_str);
    }

    if let Ok(json_str) = serde_json::to_string(&self.bar) {
        form = form.text("bar", json_str);
    }

    if let Some(ref value) = self.foo_bar {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("foo_bar", json_str);
        }
    }

    form
}
}

impl WithContentTypeRequest {
    pub fn builder() -> WithContentTypeRequestBuilder {
        <WithContentTypeRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithContentTypeRequestBuilder {
    file: Option<Vec<u8>>,
    foo: Option<String>,
    bar: Option<MyObject>,
    foo_bar: Option<MyObject>,
}

impl WithContentTypeRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn foo(mut self, value: impl Into<String>) -> Self {
        self.foo = Some(value.into());
        self
    }

    pub fn bar(mut self, value: MyObject) -> Self {
        self.bar = Some(value);
        self
    }

    pub fn foo_bar(mut self, value: MyObject) -> Self {
        self.foo_bar = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithContentTypeRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](WithContentTypeRequestBuilder::file)
    /// - [`foo`](WithContentTypeRequestBuilder::foo)
    /// - [`bar`](WithContentTypeRequestBuilder::bar)
    pub fn build(self) -> Result<WithContentTypeRequest, BuildError> {
        Ok(WithContentTypeRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
            bar: self.bar.ok_or_else(|| BuildError::missing_field("bar"))?,
            foo_bar: self.foo_bar,
        })
    }
}
