<?php

namespace Fern\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Fern\Core\Json\JsonSerializableType;
use Fern\Core\Json\JsonProperty;

class Invalid extends JsonSerializableType
{
    /**
     * @var int $integerProperty
     */
    #[JsonProperty('integer_property')]
    public int $integerProperty;

    /**
     * @param array{
     *   integerProperty: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->integerProperty = $values['integerProperty'];
    }
}

class InvalidTest extends TestCase
{
    public function testInvalidJsonThrowsException(): void
    {
        $this->expectException(\TypeError::class);
        $json = json_encode(
            [
                'integer_property' => 'not_an_integer'
            ],
            JSON_THROW_ON_ERROR
        );
        Invalid::fromJson($json);
    }
}
