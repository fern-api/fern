<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\RawClient;
use Seed\V2\V3\Problem\Types\LightweightProblemInfoV2;
use Seed\Core\JsonApiRequest;
use Seed\Environments;
use Seed\Core\HttpMethod;
use Seed\Core\JsonDecoder;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\V2\V3\Problem\Types\ProblemInfoV2;

class ProblemClient
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
    * Returns lightweight versions of all problems
     * @param ?array{baseUrl?: string} $options
     * @return array<LightweightProblemInfoV2>
     */
    public function getLightweightProblems(?array $options = null): array
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problems-v2/lightweight-problem-info",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [LightweightProblemInfoV2::class]);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
    * Returns latest versions of all problems
     * @param ?array{baseUrl?: string} $options
     * @return array<ProblemInfoV2>
     */
    public function getProblems(?array $options = null): array
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problems-v2/problem-info",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [ProblemInfoV2::class]);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
    * Returns latest version of a problem
     * @param string $problemId
     * @param ?array{baseUrl?: string} $options
     * @return ProblemInfoV2
     */
    public function getLatestProblem(string $problemId, ?array $options = null): ProblemInfoV2
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problems-v2/problem-info/$problemId",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ProblemInfoV2::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
    * Returns requested version of a problem
     * @param string $problemId
     * @param int $problemVersion
     * @param ?array{baseUrl?: string} $options
     * @return ProblemInfoV2
     */
    public function getProblemVersion(string $problemId, int $problemVersion, ?array $options = null): ProblemInfoV2
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problems-v2/problem-info/$problemId/version/$problemVersion",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ProblemInfoV2::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
