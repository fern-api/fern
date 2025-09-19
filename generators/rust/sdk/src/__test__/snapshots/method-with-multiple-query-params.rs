pub async fn gettest(limit: Option<String>, offset: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
    self.http_client.execute_request(
            Method::GET,
            "/api/test",
            None,
            QueryBuilder::new().string("limit", limit).string("offset", offset)
            .build(),
            options,
        ).await
}