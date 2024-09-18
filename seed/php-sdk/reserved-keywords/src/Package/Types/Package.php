<?php

namespace Seed\Package\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Package extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    /**
     * @param string $name
     */
    public function __construct(
        string $name,
    ) {
        $this->name = $name;
    }
}
