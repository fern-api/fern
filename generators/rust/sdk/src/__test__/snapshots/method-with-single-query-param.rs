pub async fn gettest(limit: Option<&String>, options: Option<RequestOptions>) -> Result<(), ClientError> {
    self.http_client.execute_request(
            Method::GET,
            "/api/test",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
}