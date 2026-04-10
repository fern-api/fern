<?php

namespace Fern\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Fern\Core\Json\JsonEncoder;
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
        $json = JsonEncoder::encode(
            [
                'integer_property' => 'not_an_integer'
            ],
        );
        Invalid::fromJson($json);
    }
}
