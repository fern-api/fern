<?php

namespace Seed\FolderC\Common;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FolderCFoo extends SerializableType
{
    #[JsonProperty("bar_property")]
    /**
     * @var string $barProperty
     */
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
