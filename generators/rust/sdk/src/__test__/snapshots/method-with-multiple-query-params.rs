pub async fn gettest(limit: Option<String>, offset: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
    self.http_client.execute_request(
            Method::GET,
            "/api/test",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.clone()));
            }
            if let Some(value) = offset {
                query_params.push(("offset".to_string(), value.clone()));
            }
            Some(query_params)
        },
            options,
        ).await
}