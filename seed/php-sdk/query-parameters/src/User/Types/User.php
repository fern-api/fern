<?php

namespace Seed\User\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class User extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("tags"), ArrayType(["string"])]
    /**
     * @var array<string> $tags
     */
    public array $tags;

    /**
     * @param string $name
     * @param array<string> $tags
     */
    public function __construct(
        string $name,
        array $tags,
    ) {
        $this->name = $name;
        $this->tags = $tags;
    }
}
