use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post(&self, maybe_string: Option<&Option<String>>, integer: Option<i32>, file: crate::core::File, file_list: crate::core::File, maybe_file: Option<crate::core::File>, maybe_file_list: Option<crate::core::File>, maybe_integer: Option<&Option<i32>>, optional_list_of_strings: Option<&Option<Vec<String>>>, list_of_objects: Option<&Vec<MyObject>>, optional_metadata: Option<&Option<serde_json::Value>>, optional_object_type: Option<&Option<ObjectType>>, optional_id: Option<&Option<Id>>, alias_object: Option<&MyAliasObject>, list_of_alias_object: Option<&Vec<MyAliasObject>>, alias_list_of_object: Option<&MyCollectionAliasObject>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "",
            { 
    let mut form = crate::core::create_multipart_form();
    if let Some(Some(value)) = &maybe_string {
        form = crate::core::add_text_field(form, "maybe_string", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &integer {
        form = crate::core::add_text_field(form, "integer", &value.to_string());
    }
    form = crate::core::add_file_field(form, "file", file);
    form = crate::core::add_file_field(form, "file_list", file_list);
    if let Some(value) = maybe_file {
        form = crate::core::add_file_field(form, "maybe_file", value);
    }
    if let Some(value) = maybe_file_list {
        form = crate::core::add_file_field(form, "maybe_file_list", value);
    }
    if let Some(Some(value)) = &maybe_integer {
        form = crate::core::add_text_field(form, "maybe_integer", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_list_of_strings {
        form = crate::core::add_text_field(form, "optional_list_of_strings", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &list_of_objects {
        form = crate::core::add_text_field(form, "list_of_objects", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_metadata {
        form = crate::core::add_text_field(form, "optional_metadata", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_object_type {
        form = crate::core::add_text_field(form, "optional_object_type", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_id {
        form = crate::core::add_text_field(form, "optional_id", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &alias_object {
        form = crate::core::add_text_field(form, "alias_object", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &list_of_alias_object {
        form = crate::core::add_text_field(form, "list_of_alias_object", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &alias_list_of_object {
        form = crate::core::add_text_field(form, "alias_list_of_object", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form
 },
            None,
            options,
        ).await
    }

    pub async fn just_file(&self, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/just-file",
            { 
    let mut form = crate::core::create_multipart_form();
    form = crate::core::add_file_field(form, "file", file);
    form
 },
            None,
            options,
        ).await
    }

    pub async fn just_file_with_query_params(&self, maybe_string: Option<Option<String>>, integer: Option<i32>, maybe_integer: Option<Option<i32>>, list_of_strings: Option<String>, optional_list_of_strings: Option<Option<String>>, file: crate::core::File, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/just-file-with-query-params",
            { 
    let mut form = crate::core::create_multipart_form();
    if let Some(Some(value)) = &maybe_string {
        form = crate::core::add_text_field(form, "maybe_string", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &integer {
        form = crate::core::add_text_field(form, "integer", &value.to_string());
    }
    if let Some(Some(value)) = &maybe_integer {
        form = crate::core::add_text_field(form, "maybe_integer", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &list_of_strings {
        form = crate::core::add_text_field(form, "list_of_strings", &value.to_string());
    }
    if let Some(Some(value)) = &optional_list_of_strings {
        form = crate::core::add_text_field(form, "optional_list_of_strings", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form = crate::core::add_file_field(form, "file", file);
    form
 },
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = maybe_string {
                query_params.push(("maybeString".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = integer {
                query_params.push(("integer".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = maybe_integer {
                query_params.push(("maybeInteger".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = list_of_strings {
                query_params.push(("listOfStrings".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = optional_list_of_strings {
                query_params.push(("optionalListOfStrings".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn with_content_type(&self, file: crate::core::File, foo: Option<&String>, bar: Option<&MyObject>, foo_bar: Option<&Option<MyObject>>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/with-content-type",
            { 
    let mut form = crate::core::create_multipart_form();
    form = crate::core::add_file_field(form, "file", file);
    if let Some(value) = &foo {
        form = crate::core::add_text_field(form, "foo", &value.to_string());
    }
    if let Some(value) = &bar {
        form = crate::core::add_text_field(form, "bar", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &foo_bar {
        form = crate::core::add_text_field(form, "foo_bar", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form
 },
            None,
            options,
        ).await
    }

    pub async fn with_form_encoding(&self, file: crate::core::File, foo: Option<&String>, bar: Option<&MyObject>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/with-form-encoding",
            { 
    let mut form = crate::core::create_multipart_form();
    form = crate::core::add_file_field(form, "file", file);
    if let Some(value) = &foo {
        form = crate::core::add_text_field(form, "foo", &value.to_string());
    }
    if let Some(value) = &bar {
        form = crate::core::add_text_field(form, "bar", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form
 },
            None,
            options,
        ).await
    }

    pub async fn with_form_encoded_containers(&self, maybe_string: Option<&Option<String>>, integer: Option<i32>, file: crate::core::File, file_list: crate::core::File, maybe_file: Option<crate::core::File>, maybe_file_list: Option<crate::core::File>, maybe_integer: Option<&Option<i32>>, optional_list_of_strings: Option<&Option<Vec<String>>>, list_of_objects: Option<&Vec<MyObject>>, optional_metadata: Option<&Option<serde_json::Value>>, optional_object_type: Option<&Option<ObjectType>>, optional_id: Option<&Option<Id>>, list_of_objects_with_optionals: Option<&Vec<MyObjectWithOptional>>, alias_object: Option<&MyAliasObject>, list_of_alias_object: Option<&Vec<MyAliasObject>>, alias_list_of_object: Option<&MyCollectionAliasObject>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "",
            { 
    let mut form = crate::core::create_multipart_form();
    if let Some(Some(value)) = &maybe_string {
        form = crate::core::add_text_field(form, "maybe_string", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &integer {
        form = crate::core::add_text_field(form, "integer", &value.to_string());
    }
    form = crate::core::add_file_field(form, "file", file);
    form = crate::core::add_file_field(form, "file_list", file_list);
    if let Some(value) = maybe_file {
        form = crate::core::add_file_field(form, "maybe_file", value);
    }
    if let Some(value) = maybe_file_list {
        form = crate::core::add_file_field(form, "maybe_file_list", value);
    }
    if let Some(Some(value)) = &maybe_integer {
        form = crate::core::add_text_field(form, "maybe_integer", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_list_of_strings {
        form = crate::core::add_text_field(form, "optional_list_of_strings", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &list_of_objects {
        form = crate::core::add_text_field(form, "list_of_objects", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_metadata {
        form = crate::core::add_text_field(form, "optional_metadata", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_object_type {
        form = crate::core::add_text_field(form, "optional_object_type", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(Some(value)) = &optional_id {
        form = crate::core::add_text_field(form, "optional_id", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &list_of_objects_with_optionals {
        form = crate::core::add_text_field(form, "list_of_objects_with_optionals", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &alias_object {
        form = crate::core::add_text_field(form, "alias_object", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &list_of_alias_object {
        form = crate::core::add_text_field(form, "list_of_alias_object", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    if let Some(value) = &alias_list_of_object {
        form = crate::core::add_text_field(form, "alias_list_of_object", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form
 },
            None,
            options,
        ).await
    }

    pub async fn optional_args(&self, image_file: Option<crate::core::File>, request: Option<&Option<serde_json::Value>>, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/optional-args",
            { 
    let mut form = crate::core::create_multipart_form();
    if let Some(value) = image_file {
        form = crate::core::add_file_field(form, "image_file", value);
    }
    if let Some(Some(value)) = &request {
        form = crate::core::add_text_field(form, "request", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form
 },
            None,
            options,
        ).await
    }

    pub async fn with_inline_type(&self, file: crate::core::File, request: Option<&MyInlineType>, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "/inline-type",
            { 
    let mut form = crate::core::create_multipart_form();
    form = crate::core::add_file_field(form, "file", file);
    if let Some(value) = &request {
        form = crate::core::add_text_field(form, "request", &serde_json::to_string(&value).unwrap_or_default().as_str());
    }
    form
 },
            None,
            options,
        ).await
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/snippet",
            None,
            None,
            options,
        ).await
    }

}

