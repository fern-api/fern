pub async fn gettest(options: Option<RequestOptions>) -> Result<(), ClientError> {
    self.http_client.execute_request(
            Method::GET,
            "/api/test",
            None,
            options,
        ).await
}