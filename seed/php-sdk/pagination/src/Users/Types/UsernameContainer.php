<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UsernameContainer extends SerializableType
{
    /**
     * @var array<string> $results
     */
    #[JsonProperty("results"), ArrayType(["string"])]
    public array $results;

    /**
     * @param array<string> $results
     */
    public function __construct(
        array $results,
    ) {
        $this->results = $results;
    }
}
