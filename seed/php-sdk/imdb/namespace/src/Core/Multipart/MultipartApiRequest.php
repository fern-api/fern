<?php


namespace Fern\Core\Multipart;
use Fern\Core\Client\BaseApiRequest;
use Fern\Core\Client\HttpMethod;

class MultipartApiRequest extends BaseApiRequest
{
    /**
     * @param string $baseUrl The base URL for the request
     * @param string $path The path for the request
     * @param HttpMethod $method The HTTP method for the request
     * @param array<string, string> $headers Additional headers for the request (optional)
     * @param array<string, mixed> $query Query parameters for the request (optional)
     * @param ?MultipartFormData $body The multipart form data for the request (optional)
     */
    public function __construct(
        string $baseUrl,
        string $path,
        HttpMethod $method,
        array $headers = [],
        array $query = [],
        public readonly ?MultipartFormData $body = null
    )
    {
        parent::__construct($baseUrl, $path, $method, $headers, $query);
    }
}