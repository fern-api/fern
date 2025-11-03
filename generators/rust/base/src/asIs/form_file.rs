/// Represents a file to be uploaded in a multipart/form-data request.
///
/// # Example
/// ```
/// use std::fs;
///
/// let file_data = fs::read("document.pdf").unwrap();
/// let form_file = FormFile {
///     data: file_data,
///     filename: Some("document.pdf".to_string()),
///     content_type: Some("application/pdf".to_string()),
/// };
/// ```
#[derive(Debug, Clone)]
pub struct FormFile {
    /// The raw bytes of the file
    pub data: Vec<u8>,
    /// Optional filename to include in the Content-Disposition header
    pub filename: Option<String>,
    /// Optional MIME type (e.g., "image/png", "application/pdf")
    pub content_type: Option<String>,
}

impl FormFile {
    /// Creates a new FormFile with the given data
    pub fn new(data: Vec<u8>) -> Self {
        Self {
            data,
            filename: None,
            content_type: None,
        }
    }

    /// Creates a FormFile with data, filename, and content type
    pub fn with_metadata(data: Vec<u8>, filename: String, content_type: String) -> Self {
        Self {
            data,
            filename: Some(filename),
            content_type: Some(content_type),
        }
    }

    /// Sets the filename for this file
    pub fn with_filename(mut self, filename: String) -> Self {
        self.filename = Some(filename);
        self
    }

    /// Sets the content type for this file
    pub fn with_content_type(mut self, content_type: String) -> Self {
        self.content_type = Some(content_type);
        self
    }
}

impl From<Vec<u8>> for FormFile {
    fn from(data: Vec<u8>) -> Self {
        Self::new(data)
    }
}

impl From<&[u8]> for FormFile {
    fn from(data: &[u8]) -> Self {
        Self::new(data.to_vec())
    }
}
