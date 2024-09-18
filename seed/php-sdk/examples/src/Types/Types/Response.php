<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\Identifier;

class Response extends SerializableType
{
    #[JsonProperty("response")]
    /**
     * @var mixed $response
     */
    public mixed $response;

    #[JsonProperty("identifiers"), ArrayType([Identifier::class])]
    /**
     * @var array<Identifier> $identifiers
     */
    public array $identifiers;

    /**
     * @param mixed $response
     * @param array<Identifier> $identifiers
     */
    public function __construct(
        mixed $response,
        array $identifiers,
    ) {
        $this->response = $response;
        $this->identifiers = $identifiers;
    }
}
