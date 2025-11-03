use crate::FormFile;

/// Represents a single field in a multipart/form-data request.
///
/// This enum discriminates between different types of form fields:
/// - Regular text fields
/// - Single file uploads
/// - Multiple file uploads (arrays)
#[derive(Debug, Clone)]
pub enum MultipartFormField {
    /// A regular text field
    Field { name: String, value: String },

    /// A single file upload
    File { name: String, file: FormFile },

    /// Multiple files uploaded under the same field name
    FileArray { name: String, files: Vec<FormFile> },
}

impl MultipartFormField {
    /// Creates a new text field
    pub fn field(name: impl Into<String>, value: impl Into<String>) -> Self {
        Self::Field {
            name: name.into(),
            value: value.into(),
        }
    }

    /// Creates a new file field
    pub fn file(name: impl Into<String>, file: FormFile) -> Self {
        Self::File {
            name: name.into(),
            file,
        }
    }

    /// Creates a new file array field
    pub fn file_array(name: impl Into<String>, files: Vec<FormFile>) -> Self {
        Self::FileArray {
            name: name.into(),
            files,
        }
    }

    /// Returns the field name
    pub fn name(&self) -> &str {
        match self {
            Self::Field { name, .. } => name,
            Self::File { name, .. } => name,
            Self::FileArray { name, .. } => name,
        }
    }
}
