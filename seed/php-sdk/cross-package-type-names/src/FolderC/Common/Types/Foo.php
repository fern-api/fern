<?php

namespace Seed\FolderC\Common\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Foo extends SerializableType
{
    /**
     * @var string $barProperty
     */
    #[JsonProperty("bar_property")]
    public string $barProperty;

    /**
     * @param string $barProperty
     */
    public function __construct(
        string $barProperty,
    ) {
        $this->barProperty = $barProperty;
    }
}
