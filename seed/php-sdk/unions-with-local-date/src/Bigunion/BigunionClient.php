<?php

namespace Seed\Bigunion;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Types\BigUnionZero;
use Seed\Types\BigUnionOne;
use Seed\Types\BigUnionTwo;
use Seed\Types\BigUnionThree;
use Seed\Types\BigUnionFour;
use Seed\Types\BigUnionFive;
use Seed\Types\BigUnionSix;
use Seed\Types\BigUnionSeven;
use Seed\Types\BigUnionEight;
use Seed\Types\BigUnionNine;
use Seed\Types\BigUnionTen;
use Seed\Types\BigUnionEleven;
use Seed\Types\BigUnionTwelve;
use Seed\Types\BigUnionThirteen;
use Seed\Types\BigUnionFourteen;
use Seed\Types\BigUnionFifteen;
use Seed\Types\BigUnionSixteen;
use Seed\Types\BigUnionSeventeen;
use Seed\Types\BigUnionEighteen;
use Seed\Types\BigUnionNineteen;
use Seed\Types\BigUnionTwenty;
use Seed\Types\BigUnionTwentyOne;
use Seed\Types\BigUnionTwentyTwo;
use Seed\Types\BigUnionTwentyThree;
use Seed\Types\BigUnionTwentyFour;
use Seed\Types\BigUnionTwentyFive;
use Seed\Types\BigUnionTwentySix;
use Seed\Types\BigUnionTwentySeven;
use Seed\Types\BigUnionTwentyEight;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use Seed\Core\Json\JsonDecoder;
use Seed\Core\Types\Union;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\Json\JsonSerializer;

class BigunionClient
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * @param string $id
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return (
     *    BigUnionZero
     *   |BigUnionOne
     *   |BigUnionTwo
     *   |BigUnionThree
     *   |BigUnionFour
     *   |BigUnionFive
     *   |BigUnionSix
     *   |BigUnionSeven
     *   |BigUnionEight
     *   |BigUnionNine
     *   |BigUnionTen
     *   |BigUnionEleven
     *   |BigUnionTwelve
     *   |BigUnionThirteen
     *   |BigUnionFourteen
     *   |BigUnionFifteen
     *   |BigUnionSixteen
     *   |BigUnionSeventeen
     *   |BigUnionEighteen
     *   |BigUnionNineteen
     *   |BigUnionTwenty
     *   |BigUnionTwentyOne
     *   |BigUnionTwentyTwo
     *   |BigUnionTwentyThree
     *   |BigUnionTwentyFour
     *   |BigUnionTwentyFive
     *   |BigUnionTwentySix
     *   |BigUnionTwentySeven
     *   |BigUnionTwentyEight
     * )|null
     * @throws SeedException
     * @throws SeedApiException
     */
    public function get(string $id, ?array $options = null): BigUnionZero|BigUnionOne|BigUnionTwo|BigUnionThree|BigUnionFour|BigUnionFive|BigUnionSix|BigUnionSeven|BigUnionEight|BigUnionNine|BigUnionTen|BigUnionEleven|BigUnionTwelve|BigUnionThirteen|BigUnionFourteen|BigUnionFifteen|BigUnionSixteen|BigUnionSeventeen|BigUnionEighteen|BigUnionNineteen|BigUnionTwenty|BigUnionTwentyOne|BigUnionTwentyTwo|BigUnionTwentyThree|BigUnionTwentyFour|BigUnionTwentyFive|BigUnionTwentySix|BigUnionTwentySeven|BigUnionTwentyEight|null
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "bigunion/{$id}",
                    method: HttpMethod::GET,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeUnion($json, new Union(BigUnionZero::class, BigUnionOne::class, BigUnionTwo::class, BigUnionThree::class, BigUnionFour::class, BigUnionFive::class, BigUnionSix::class, BigUnionSeven::class, BigUnionEight::class, BigUnionNine::class, BigUnionTen::class, BigUnionEleven::class, BigUnionTwelve::class, BigUnionThirteen::class, BigUnionFourteen::class, BigUnionFifteen::class, BigUnionSixteen::class, BigUnionSeventeen::class, BigUnionEighteen::class, BigUnionNineteen::class, BigUnionTwenty::class, BigUnionTwentyOne::class, BigUnionTwentyTwo::class, BigUnionTwentyThree::class, BigUnionTwentyFour::class, BigUnionTwentyFive::class, BigUnionTwentySix::class, BigUnionTwentySeven::class, BigUnionTwentyEight::class)); // @phpstan-ignore-line
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * @param (
     *    BigUnionZero
     *   |BigUnionOne
     *   |BigUnionTwo
     *   |BigUnionThree
     *   |BigUnionFour
     *   |BigUnionFive
     *   |BigUnionSix
     *   |BigUnionSeven
     *   |BigUnionEight
     *   |BigUnionNine
     *   |BigUnionTen
     *   |BigUnionEleven
     *   |BigUnionTwelve
     *   |BigUnionThirteen
     *   |BigUnionFourteen
     *   |BigUnionFifteen
     *   |BigUnionSixteen
     *   |BigUnionSeventeen
     *   |BigUnionEighteen
     *   |BigUnionNineteen
     *   |BigUnionTwenty
     *   |BigUnionTwentyOne
     *   |BigUnionTwentyTwo
     *   |BigUnionTwentyThree
     *   |BigUnionTwentyFour
     *   |BigUnionTwentyFive
     *   |BigUnionTwentySix
     *   |BigUnionTwentySeven
     *   |BigUnionTwentyEight
     * ) $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?bool
     * @throws SeedException
     * @throws SeedApiException
     */
    public function update(BigUnionZero|BigUnionOne|BigUnionTwo|BigUnionThree|BigUnionFour|BigUnionFive|BigUnionSix|BigUnionSeven|BigUnionEight|BigUnionNine|BigUnionTen|BigUnionEleven|BigUnionTwelve|BigUnionThirteen|BigUnionFourteen|BigUnionFifteen|BigUnionSixteen|BigUnionSeventeen|BigUnionEighteen|BigUnionNineteen|BigUnionTwenty|BigUnionTwentyOne|BigUnionTwentyTwo|BigUnionTwentyThree|BigUnionTwentyFour|BigUnionTwentyFive|BigUnionTwentySix|BigUnionTwentySeven|BigUnionTwentyEight $request, ?array $options = null): ?bool
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "bigunion",
                    method: HttpMethod::PATCH,
                    body: JsonSerializer::serializeUnion($request, new Union(BigUnionZero::class, BigUnionOne::class, BigUnionTwo::class, BigUnionThree::class, BigUnionFour::class, BigUnionFive::class, BigUnionSix::class, BigUnionSeven::class, BigUnionEight::class, BigUnionNine::class, BigUnionTen::class, BigUnionEleven::class, BigUnionTwelve::class, BigUnionThirteen::class, BigUnionFourteen::class, BigUnionFifteen::class, BigUnionSixteen::class, BigUnionSeventeen::class, BigUnionEighteen::class, BigUnionNineteen::class, BigUnionTwenty::class, BigUnionTwentyOne::class, BigUnionTwentyTwo::class, BigUnionTwentyThree::class, BigUnionTwentyFour::class, BigUnionTwentyFive::class, BigUnionTwentySix::class, BigUnionTwentySeven::class, BigUnionTwentyEight::class)),
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeBool($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * @param array<(
     *    BigUnionZero
     *   |BigUnionOne
     *   |BigUnionTwo
     *   |BigUnionThree
     *   |BigUnionFour
     *   |BigUnionFive
     *   |BigUnionSix
     *   |BigUnionSeven
     *   |BigUnionEight
     *   |BigUnionNine
     *   |BigUnionTen
     *   |BigUnionEleven
     *   |BigUnionTwelve
     *   |BigUnionThirteen
     *   |BigUnionFourteen
     *   |BigUnionFifteen
     *   |BigUnionSixteen
     *   |BigUnionSeventeen
     *   |BigUnionEighteen
     *   |BigUnionNineteen
     *   |BigUnionTwenty
     *   |BigUnionTwentyOne
     *   |BigUnionTwentyTwo
     *   |BigUnionTwentyThree
     *   |BigUnionTwentyFour
     *   |BigUnionTwentyFive
     *   |BigUnionTwentySix
     *   |BigUnionTwentySeven
     *   |BigUnionTwentyEight
     * )> $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<string, bool>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateMany(array $request, ?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "bigunion/many",
                    method: HttpMethod::PATCH,
                    body: JsonSerializer::serializeArray($request, [new Union(BigUnionZero::class, BigUnionOne::class, BigUnionTwo::class, BigUnionThree::class, BigUnionFour::class, BigUnionFive::class, BigUnionSix::class, BigUnionSeven::class, BigUnionEight::class, BigUnionNine::class, BigUnionTen::class, BigUnionEleven::class, BigUnionTwelve::class, BigUnionThirteen::class, BigUnionFourteen::class, BigUnionFifteen::class, BigUnionSixteen::class, BigUnionSeventeen::class, BigUnionEighteen::class, BigUnionNineteen::class, BigUnionTwenty::class, BigUnionTwentyOne::class, BigUnionTwentyTwo::class, BigUnionTwentyThree::class, BigUnionTwentyFour::class, BigUnionTwentyFive::class, BigUnionTwentySix::class, BigUnionTwentySeven::class, BigUnionTwentyEight::class)]),
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeArray($json, ['string' => 'bool']); // @phpstan-ignore-line
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }
}
