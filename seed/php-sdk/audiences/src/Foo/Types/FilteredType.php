<?php

namespace Seed\Foo\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FilteredType extends SerializableType
{
    /**
     * @var int $privateProperty
     */
    #[JsonProperty("private_property")]
    public int $privateProperty;

    /**
     * @var ?string $publicProperty
     */
    #[JsonProperty("public_property")]
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
