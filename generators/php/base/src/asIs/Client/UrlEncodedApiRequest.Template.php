<?php

namespace <%= namespace%>;

class UrlEncodedApiRequest extends BaseApiRequest
{
    /**
     * @param string $baseUrl The base URL for the request
     * @param string $path The path for the request
     * @param HttpMethod $method The HTTP method for the request
     * @param array<string, string> $headers Additional headers for the request (optional)
     * @param array<string, mixed> $query Query parameters for the request (optional)
     * @param mixed|null $body The form-urlencoded request body (optional)<% if (it.respectOptionalRequestBody) { %>
     * @param bool $omitContentTypeWithoutBody Whether a request that carries no body also carries no
     *                                         Content-Type (optional)<% } %>
     */
    public function __construct(
        string $baseUrl,
        string $path,
        HttpMethod $method,
        array $headers = [],
        array $query = [],
        public readonly mixed $body = null<% if (it.respectOptionalRequestBody) { %>,
        bool $omitContentTypeWithoutBody = false<% } %>
    ) {
        parent::__construct($baseUrl, $path, $method, $headers, $query<% if (it.respectOptionalRequestBody) { %>, $omitContentTypeWithoutBody<% } %>);
    }
}
