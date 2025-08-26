use reqwest::multipart::{Form, Part};
use crate::core::File;

/// Create a new multipart form
pub fn create_multipart_form() -> Form {
    Form::new()
}

/// Add a text field to the form
pub fn add_text_field(form: Form, name: &str, value: &str) -> Form {
    form.text(name.to_string(), value.to_string())
}

/// Add a file field to the form
pub fn add_file_field(form: Form, name: &str, file: File) -> Form {
    // Get content type and clone data before moving file
    let content_type = file.get_content_type();
    let data = file.data.clone();
    let mut part = Part::bytes(file.data);
    
    // Set filename if available
    if let Some(filename) = file.filename {
        part = part.file_name(filename);
    }
    
    // Set content type based on filename
    let final_part = if content_type.parse::<mime::Mime>().is_ok() {
        match part.mime_str(content_type) {
            Ok(part_with_mime) => part_with_mime,
            Err(_) => Part::bytes(data) // Fallback if MIME setting fails
        }
    } else {
        part
    };
    
    form.part(name.to_string(), final_part)
}