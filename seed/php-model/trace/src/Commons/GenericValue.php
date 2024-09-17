<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GenericValue extends SerializableType
{
    #[JsonProperty("stringifiedValue")]
    /**
     * @var string $stringifiedValue
     */
    public string $stringifiedValue;

    #[JsonProperty("stringifiedType")]
    /**
     * @var ?string $stringifiedType
     */
    public ?string $stringifiedType;

    /**
     * @param string $stringifiedValue
     * @param ?string $stringifiedType
     */
    public function __construct(
        string $stringifiedValue,
        ?string $stringifiedType = null,
    ) {
        $this->stringifiedValue = $stringifiedValue;
        $this->stringifiedType = $stringifiedType;
    }
}
