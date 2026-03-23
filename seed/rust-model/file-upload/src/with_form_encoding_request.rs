pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithFormEncodingRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(default)]
    pub foo: String,
    #[serde(default)]
    pub bar: MyObject,
}
impl WithFormEncodingRequest {
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

    form
}
}

impl WithFormEncodingRequest {
    pub fn builder() -> WithFormEncodingRequestBuilder {
        WithFormEncodingRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithFormEncodingRequestBuilder {
    file: Option<Vec<u8>>,
    foo: Option<String>,
    bar: Option<MyObject>,
}

impl WithFormEncodingRequestBuilder {
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

    /// Consumes the builder and constructs a [`WithFormEncodingRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](WithFormEncodingRequestBuilder::file)
    /// - [`foo`](WithFormEncodingRequestBuilder::foo)
    /// - [`bar`](WithFormEncodingRequestBuilder::bar)
    pub fn build(self) -> Result<WithFormEncodingRequest, BuildError> {
        Ok(WithFormEncodingRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
            bar: self.bar.ok_or_else(|| BuildError::missing_field("bar"))?,
        })
    }
}
