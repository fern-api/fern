<?php

namespace Seed\User;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class User extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var array<string> $tags
     */
    #[JsonProperty("tags"), ArrayType(["string"])]
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
