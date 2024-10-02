<?php

namespace Seed\Foo\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class FilteredType extends SerializableType
{
    /**
     * @var ?string $publicProperty
     */
    #[JsonProperty('public_property')]
    public ?string $publicProperty;

    /**
     * @var int $privateProperty
     */
    #[JsonProperty('private_property')]
    public int $privateProperty;

    /**
     * @param array{
     *   publicProperty?: ?string,
     *   privateProperty: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->publicProperty = $values['publicProperty'] ?? null;
        $this->privateProperty = $values['privateProperty'];
    }
}
