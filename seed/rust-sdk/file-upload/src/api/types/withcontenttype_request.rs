pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithcontenttypeRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bar: Option<MyObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo_bar: Option<MyObject>,
}
impl WithcontenttypeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        if let Some(ref file_data) = self.file {
            form = form.part(
                "file",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("file")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref value) = self.foo {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("foo", json_str);
            }
        }

        if let Some(ref value) = self.bar {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("bar", json_str);
            }
        }

        if let Some(ref value) = self.foo_bar {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("foo_bar", json_str);
            }
        }

        form
    }
}

impl WithcontenttypeRequest {
    pub fn builder() -> WithcontenttypeRequestBuilder {
        <WithcontenttypeRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithcontenttypeRequestBuilder {
    file: Option<Vec<u8>>,
    foo: Option<String>,
    bar: Option<MyObject>,
    foo_bar: Option<MyObject>,
}

impl WithcontenttypeRequestBuilder {
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

    /// Consumes the builder and constructs a [`WithcontenttypeRequest`].
    pub fn build(self) -> Result<WithcontenttypeRequest, BuildError> {
        Ok(WithcontenttypeRequest {
            file: self.file,
            foo: self.foo,
            bar: self.bar,
            foo_bar: self.foo_bar,
        })
    }
}
