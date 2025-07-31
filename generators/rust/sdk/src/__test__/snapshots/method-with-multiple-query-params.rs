pub async fn gettest(limit: Option<&String>, offset: Option<&String>, options: Option<RequestOptions>) -> Result<(), ClientError> {
    self.http_client.execute_request(
            Method::GET,
            "/api/test",
            None,
            {
            let mut request_options = options.unwrap_or_default();
            if let Some(value) = limit {
                request_options.query_parameters.insert("limit".to_string(), value.to_string());
            }
            if let Some(value) = offset {
                request_options.query_parameters.insert("offset".to_string(), value.to_string());
            }
            Some(request_options)
        },
        ).await
}