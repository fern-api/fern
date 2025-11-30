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
    public function testGetAndReturnString(): void {
        $testId = 'endpoints.primitive.get_and_return_string.0';
        $this->client->endpoints->primitive->getAndReturnString(
            'string',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_string.0',
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
    public function testGetAndReturnInt(): void {
        $testId = 'endpoints.primitive.get_and_return_int.0';
        $this->client->endpoints->primitive->getAndReturnInt(
            1,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_int.0',
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
    public function testGetAndReturnLong(): void {
        $testId = 'endpoints.primitive.get_and_return_long.0';
        $this->client->endpoints->primitive->getAndReturnLong(
            1000000,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_long.0',
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
    public function testGetAndReturnDouble(): void {
        $testId = 'endpoints.primitive.get_and_return_double.0';
        $this->client->endpoints->primitive->getAndReturnDouble(
            1.1,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_double.0',
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
    public function testGetAndReturnBool(): void {
        $testId = 'endpoints.primitive.get_and_return_bool.0';
        $this->client->endpoints->primitive->getAndReturnBool(
            true,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_bool.0',
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
    public function testGetAndReturnDatetime(): void {
        $testId = 'endpoints.primitive.get_and_return_datetime.0';
        $this->client->endpoints->primitive->getAndReturnDatetime(
            new DateTime('2024-01-15T09:30:00Z'),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_datetime.0',
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
    public function testGetAndReturnDate(): void {
        $testId = 'endpoints.primitive.get_and_return_date.0';
        $this->client->endpoints->primitive->getAndReturnDate(
            new DateTime('2023-01-15'),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_date.0',
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
    public function testGetAndReturnUuid(): void {
        $testId = 'endpoints.primitive.get_and_return_uuid.0';
        $this->client->endpoints->primitive->getAndReturnUuid(
            'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_uuid.0',
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
    public function testGetAndReturnBase64(): void {
        $testId = 'endpoints.primitive.get_and_return_base_64.0';
        $this->client->endpoints->primitive->getAndReturnBase64(
            'SGVsbG8gd29ybGQh',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.primitive.get_and_return_base_64.0',
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
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => 'http://localhost:8080',
        ],
        );
    }
}
