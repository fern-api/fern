pub async fn gettest(request: &getTestQueryRequest, options: Option<RequestOptions>) -> Result<(), ApiError> {
    self.http_client.execute_request(
            Method::GET,
            "/api/test",
            None,
            QueryBuilder::new().string("limit", request.limit.clone())
            .build(),
            options,
        ).await
}