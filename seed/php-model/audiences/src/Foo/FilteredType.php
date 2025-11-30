<?php

namespace Seed\Foo;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FilteredType extends JsonSerializableType
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
     *   privateProperty: int,
     *   publicProperty?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->publicProperty = $values['publicProperty'] ?? null;$this->privateProperty = $values['privateProperty'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
