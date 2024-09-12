<?php

namespace Seed\Core;

use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Utils;
use InvalidArgumentException;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Message\StreamInterface;
use Seed\ClientOptions;


class RawClient
{
    /**
     * The client options used to make requests.
     *
     * @var ClientOptions
     */
    private ClientOptions $clientOptions;

    /**
     * The client options used to make requests.
     *
     * * @param ClientOptions|null $clientOptions
     */
    public function __construct(
        ?ClientOptions $clientOptions,
    )
    {
        $this->clientOptions = $clientOptions ?? new ClientOptions();
    }

    /**
     * The client options used to make requests.
     *
     * @throws ClientExceptionInterface
     */
    public function sendRequest(
        BaseApiRequest $request,
    ): BaseApiResponse
    {
        $httpRequest = $this->buildRequest($request);
        $httpResponse = $this->clientOptions->httpClient->send($httpRequest);
        return new BaseApiResponse(
            $httpResponse->getStatusCode(),
            $httpResponse,
        );
    }

    private function buildRequest(
        BaseApiRequest $request
    ): Request {
       $url = $this->buildUrl($request);
       $headers = $this->encodeHeaders($request);
       $body = $this->encodeRequestBody($request);
       return new Request(
           $request->method->value,
           $url,
           $headers,
           $body,
       );
    }
    /**
     * The client options used to make requests.
     *
     * @return array<string, string>
     */
    private function encodeHeaders(
        BaseApiRequest $request
    ): array
    {
        return match (get_class($request)) {
            JsonApiRequest::class => array_merge(
                ["Content-Type" => "application/json"],
                $this->clientOptions->headers,
                $request->headers
            ),
            default => throw new InvalidArgumentException('Unsupported request type: ' . get_class($request)),
        };
    }

    private function encodeRequestBody(
        BaseApiRequest $request
    ): ?StreamInterface
    {
        return match (get_class($request)) {
            JsonApiRequest::class => $request->body != null ? Utils::streamFor(json_encode($request->body)) : null,
            default => throw new InvalidArgumentException('Unsupported request type: '.get_class($request)),
        };
    }

    private function buildUrl(
        BaseApiRequest $request
    ): string {
        $baseUrl = $request->baseUrl;
        $trimmedBaseUrl = rtrim($baseUrl, '/');
        $trimmedBasePath = ltrim($request->path, '/');
        $url = "{$trimmedBaseUrl}/{$trimmedBasePath}";

        if (!empty($request->query)) {
            $url .= '?' . $this->encodeQuery($request->query);
        }

        return $url;
    }

    /**
     * @param array<string, mixed> $query
     */
    private function encodeQuery(
        array $query
    ): string {
        $parts = [];
        foreach ($query as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $item) {
                    $parts[] = urlencode($key).'='.$this->encodeQueryValue($item);
                }
            } else {
                $parts[] = urlencode($key).'='.$this->encodeQueryValue($value);
            }
        }
        return implode('&', $parts);
    }

    private function encodeQueryValue(
        mixed $value
    ): string {
        if (is_string($value)) {
            return urlencode($value);
        }
        if (is_scalar($value)) {
            return urlencode((string)$value);
        }
        if (is_null($value)) {
            return 'null';
        }
        // Unreachable, but included for a best effort.
        return urlencode(strval(json_encode($value)));
    }
}
