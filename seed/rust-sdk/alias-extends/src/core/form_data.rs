use reqwest::multipart::{Form, Part};
use serde::Serialize;
use crate::core::File;

/// Trait for types that can be converted to text for form data
pub trait ToFormText {
    fn to_form_text(&self) -> String;
}

impl ToFormText for String {
    fn to_form_text(&self) -> String {
        self.clone()
    }
}

impl ToFormText for &str {
    fn to_form_text(&self) -> String {
        self.to_string()
    }
}

impl ToFormText for i32 {
    fn to_form_text(&self) -> String {
        self.to_string()
    }
}

impl ToFormText for Option<String> {
    fn to_form_text(&self) -> String {
        match self {
            Some(s) => s.clone(),
            None => String::new(),
        }
    }
}

impl ToFormText for Option<i32> {
    fn to_form_text(&self) -> String {
        match self {
            Some(i) => i.to_string(),
            None => String::new(),
        }
    }
}

impl ToFormText for Option<Option<String>> {
    fn to_form_text(&self) -> String {
        match self {
            Some(Some(s)) => s.clone(),
            _ => String::new(),
        }
    }
}

impl ToFormText for Option<Option<i32>> {
    fn to_form_text(&self) -> String {
        match self {
            Some(Some(i)) => i.to_string(),
            _ => String::new(),
        }
    }
}

/// A builder for creating multipart form data requests
#[derive(Debug)]
pub struct FormDataBuilder {
    form: Form,
}

impl FormDataBuilder {
    /// Create a new FormDataBuilder
    pub fn new() -> Self {
        Self {
            form: Form::new(),
        }
    }

    /// Add a text field to the form
    pub fn add_text<K, V>(mut self, name: K, value: V) -> Self
    where
        K: Into<String>,
        V: Into<String>,
    {
        self.form = self.form.text(name.into(), value.into());
        self
    }

    /// Add a file field to the form
    pub fn add_file<K>(mut self, name: K, file: File) -> Self
    where
        K: Into<String>,
    {
        let data_backup = file.data.clone();
        let mut part = Part::bytes(file.data);

        // Set filename if available
        if let Some(filename) = file.filename {
            part = part.file_name(filename);
        }

        // Set content type if available
        let final_part = if let Some(content_type) = file.content_type {
            if content_type.parse::<mime::Mime>().is_ok() {
                part.mime_str(&content_type).unwrap_or_else(|_| Part::bytes(data_backup))
            } else {
                part
            }
        } else {
            part
        };

        self.form = self.form.part(name.into(), final_part);
        self
    }

    /// Add a JSON field to the form (serializes the value as JSON string)
    pub fn add_json<K, V>(mut self, name: K, value: &V) -> Result<Self, serde_json::Error>
    where
        K: Into<String>,
        V: Serialize,
    {
        let json_str = serde_json::to_string(value)?;
        self.form = self.form.text(name.into(), json_str);
        Ok(self)
    }

    /// Add bytes directly as a form field
    pub fn add_bytes<K>(mut self, name: K, bytes: Vec<u8>) -> Self
    where
        K: Into<String>,
    {
        let part = Part::bytes(bytes);
        self.form = self.form.part(name.into(), part);
        self
    }

    /// Add bytes with a specific content type
    pub fn add_bytes_with_mime<K>(mut self, name: K, bytes: Vec<u8>, content_type: &str) -> Self
    where
        K: Into<String>,
    {
        let bytes_backup = bytes.clone();
        let part = Part::bytes(bytes);
        let final_part = if content_type.parse::<mime::Mime>().is_ok() {
            part.mime_str(content_type).unwrap_or_else(|_| Part::bytes(bytes_backup))
        } else {
            part
        };
        self.form = self.form.part(name.into(), final_part);
        self
    }

    /// Add an optional text field (handles various option types)
    pub fn add_optional_text<K, V>(self, name: K, value: &V) -> Self
    where
        K: Into<String>,
        V: ToFormText,
    {
        let text = value.to_form_text();
        if !text.is_empty() {
            self.add_text(name, text)
        } else {
            self
        }
    }

    /// Add an optional text field for nested options (flattens Option<Option<T>>)
    pub fn add_optional_text_nested<K, V>(self, name: K, value: Option<Option<V>>) -> Self
    where
        K: Into<String>,
        V: std::fmt::Display,
    {
        match value {
            Some(Some(v)) => self.add_text(name, v.to_string()),
            _ => self,
        }
    }

    /// Special handling for Option<Option<String>>
    pub fn add_optional_text_string(self, name: impl Into<String>, value: Option<Option<String>>) -> Self {
        match value {
            Some(Some(v)) => self.add_text(name, v),
            _ => self,
        }
    }

    /// Add an optional file field (only adds if Some)
    pub fn add_optional_file<K>(self, name: K, file: Option<File>) -> Self
    where
        K: Into<String>,
    {
        match file {
            Some(f) => self.add_file(name, f),
            None => self,
        }
    }

    /// Add an optional JSON field (only adds if Some)
    pub fn add_optional_json<K, V>(self, name: K, value: Option<&V>) -> Result<Self, serde_json::Error>
    where
        K: Into<String>,
        V: Serialize,
    {
        match value {
            Some(v) => self.add_json(name, v),
            None => Ok(self),
        }
    }

    /// Build the final Form for use with reqwest
    pub fn build(self) -> Form {
        self.form
    }
}

impl Default for FormDataBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// Helper function to create a simple text-only form
pub fn create_text_form<K, V>(fields: Vec<(K, V)>) -> Form
where
    K: Into<String>,
    V: Into<String>,
{
    let mut builder = FormDataBuilder::new();
    for (key, value) in fields {
        builder = builder.add_text(key, value);
    }
    builder.build()
}

/// Helper function to create a form with a single file
pub fn create_file_form<K>(name: K, file: File) -> Form
where
    K: Into<String>,
{
    FormDataBuilder::new()
        .add_file(name, file)
        .build()
}