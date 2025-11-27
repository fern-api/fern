<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use DateTime;

class EndpointsContentTypeWireTest extends WireMockTestCase
{

    /**
     */
    public function testPostJsonPatchContentType(): void {
        $testId = 'endpoints.content_type.post_json_patch_content_type.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->contentType->postJsonPatchContentType(
            new ObjectWithOptionalField([
                'string' => 'string',
                'integer' => 1,
                'long' => 1000000,
                'double' => 1.1,
                'bool' => true,
                'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                'date' => new DateTime('2023-01-15'),
                'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'base64' => 'SGVsbG8gd29ybGQh',
                'list' => [
                    'list',
                    'list',
                ],
                'set' => [
                    'set',
                ],
                'map' => [
                    1 => 'map',
                ],
                'bigint' => '1000000',
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo/bar",
            null,
            1
        );
    }

    /**
     */
    public function testPostJsonPatchContentWithCharsetType(): void {
        $testId = 'endpoints.content_type.post_json_patch_content_with_charset_type.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->contentType->postJsonPatchContentWithCharsetType(
            new ObjectWithOptionalField([
                'string' => 'string',
                'integer' => 1,
                'long' => 1000000,
                'double' => 1.1,
                'bool' => true,
                'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                'date' => new DateTime('2023-01-15'),
                'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'base64' => 'SGVsbG8gd29ybGQh',
                'list' => [
                    'list',
                    'list',
                ],
                'set' => [
                    'set',
                ],
                'map' => [
                    1 => 'map',
                ],
                'bigint' => '1000000',
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo/baz",
            null,
            1
        );
    }
}
