//! Core client infrastructure

mod api_client_builder;
mod http_client;
mod request_options;
mod client_error;
mod file;
mod form_data;
mod stream;
mod bytes_utils;
mod pagination;

pub use api_client_builder::ApiClientBuilder;
pub use http_client::HttpClient;
pub use request_options::RequestOptions;
pub use client_error::ClientError;
pub use file::File;
pub use form_data::{create_multipart_form, add_text_field, add_file_field};
pub use stream::download_file;
pub use bytes_utils::*;
pub use pagination::*;