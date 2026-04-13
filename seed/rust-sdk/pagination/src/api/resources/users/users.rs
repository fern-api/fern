use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn listwithcursorpagination(
        &self,
        request: &ListwithcursorpaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/cursor",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .serialize("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
                    .serialize("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithmixedtypecursorpagination(
        &self,
        request: &ListwithmixedtypecursorpaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersMixedTypePaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "users/mixed-type-cursor",
                None,
                QueryBuilder::new()
                    .serialize("cursor", request.cursor.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithbodycursorpagination(
        &self,
        request: &UsersListWithBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "users/body-cursor",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn listwithtoplevelbodycursorpagination(
        &self,
        request: &UsersListWithTopLevelBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersTopLevelCursorPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "users/top-level-cursor",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn listwithoffsetpagination(
        &self,
        request: &ListwithoffsetpaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/offset",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .serialize("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
                    .serialize("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithdoubleoffsetpagination(
        &self,
        request: &ListwithdoubleoffsetpaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/double-offset",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .serialize("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
                    .serialize("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithbodyoffsetpagination(
        &self,
        request: &UsersListWithBodyOffsetPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "users/body-offset",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn listwithoffsetsteppagination(
        &self,
        request: &ListwithoffsetsteppaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/offset-step",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .serialize("limit", request.limit.clone())
                    .serialize("order", request.order.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithoffsetpaginationhasnextpage(
        &self,
        request: &ListwithoffsetpaginationhasnextpageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/offset-has-next-page",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .serialize("limit", request.limit.clone())
                    .serialize("order", request.order.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithextendedresults(
        &self,
        request: &ListwithextendedresultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersExtendedResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/extended",
                None,
                QueryBuilder::new()
                    .serialize("cursor", request.cursor.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithextendedresultsandoptionaldata(
        &self,
        request: &ListwithextendedresultsandoptionaldataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersExtendedOptionalListResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/extended-optional",
                None,
                QueryBuilder::new()
                    .serialize("cursor", request.cursor.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listusernames(
        &self,
        request: &ListusernamesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameCursor, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/usernames",
                None,
                QueryBuilder::new()
                    .serialize("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listusernameswithoptionalresponse(
        &self,
        request: &ListusernameswithoptionalresponseQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameCursor, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/usernames-optional",
                None,
                QueryBuilder::new()
                    .serialize("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithglobalconfig(
        &self,
        request: &ListwithglobalconfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameContainer, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/global-config",
                None,
                QueryBuilder::new()
                    .serialize("offset", request.offset.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithoptionaldata(
        &self,
        request: &ListwithoptionaldataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersOptionalDataPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/optional-data",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn listwithaliaseddata(
        &self,
        request: &ListwithaliaseddataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersAliasedDataPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users/aliased-data",
                None,
                QueryBuilder::new()
                    .serialize("page", request.page.clone())
                    .serialize("per_page", request.per_page.clone())
                    .serialize("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }
}
