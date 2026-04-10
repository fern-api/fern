<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use DateTime;

class EndpointsPrimitiveWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnString(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_string.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnString(
            'string',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_string.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/string",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnInt(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_int.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnInt(
            1,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_int.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/integer",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnLong(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_long.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnLong(
            1000000,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_long.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/long",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnDouble(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_double.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnDouble(
            1.1,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_double.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/double",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnBool(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_bool.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnBool(
            true,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_bool.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/boolean",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnDatetime(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_datetime.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnDatetime(
            new DateTime('2024-01-15T09:30:00Z'),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_datetime.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/datetime",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnDate(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_date.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnDate(
            new DateTime('2023-01-15'),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_date.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/date",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnUuid(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_uuid.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnUuid(
            'string',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_uuid.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/uuid",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsPrimitiveGetAndReturnBase64(): void {
        $testId = 'endpoints_primitive.endpoints_primitive_get_and_return_base64.0';
        $this->client->endpointsPrimitive->endpointsPrimitiveGetAndReturnBase64(
            'string',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_primitive.endpoints_primitive_get_and_return_base64.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/base64",
            null,
            1
        );
    }

    /**
     */
    protected function setUp(): void {
        parent::setUp();
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
