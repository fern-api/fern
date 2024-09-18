<?php

namespace Seed\Service;

use Seed\Core\RawClient;
use Seed\Service\Requests\MyRequest;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;
use Seed\Service\Requests\JustFileRequet;
use Seed\Service\Requests\JustFileWithQueryParamsRequet;

class ServiceClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
    }

    /**
     * @param MyRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function post(MyRequest $request, ?array $options): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param JustFileRequet $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function justFile(JustFileRequet $request, ?array $options): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param JustFileWithQueryParamsRequet $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function justFileWithQueryParams(JustFileWithQueryParamsRequet $request, ?array $options): mixed
    {
        $query = [];
        $query['integer'] = $request->integer;
        $query['listOfStrings'] = $request->listOfStrings;
        $query['optionalListOfStrings'] = $request->optionalListOfStrings;
        if ($request->maybeString != null) {
            $query['maybeString'] = $request->maybeString;
        }
        if ($request->maybeInteger != null) {
            $query['maybeInteger'] = $request->maybeInteger;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
