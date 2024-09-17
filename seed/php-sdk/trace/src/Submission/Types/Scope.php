<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Scope extends SerializableType
{
    #[JsonProperty("variables"), ArrayType(["string" => "mixed"])]
    /**
     * @var array<string, mixed> $variables
     */
    public array $variables;

    /**
     * @param array<string, mixed> $variables
     */
    public function __construct(
        array $variables,
    ) {
        $this->variables = $variables;
    }
}
