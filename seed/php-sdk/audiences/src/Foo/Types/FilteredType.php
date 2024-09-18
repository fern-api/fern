<?php

namespace Seed\Foo\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FilteredType extends SerializableType
{
    #[JsonProperty("private_property")]
    /**
     * @var int $privateProperty
     */
    public int $privateProperty;

    #[JsonProperty("public_property")]
    /**
     * @var ?string $publicProperty
     */
    public ?string $publicProperty;

    /**
     * @param int $privateProperty
     * @param ?string $publicProperty
     */
    public function __construct(
        int $privateProperty,
        ?string $publicProperty = null,
    ) {
        $this->privateProperty = $privateProperty;
        $this->publicProperty = $publicProperty;
    }
}
