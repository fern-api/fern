<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Identifier;
use Seed\Core\ArrayType;

class Response extends SerializableType
{
    /**
     * @var mixed $response
     */
    #[JsonProperty('response')]
    public mixed $response;

    /**
     * @var array<Identifier> $identifiers
     */
    #[JsonProperty('identifiers'), ArrayType([Identifier::class])]
    public array $identifiers;

    /**
     * @param array{
     *   response: mixed,
     *   identifiers: array<Identifier>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->response = $values['response'];
        $this->identifiers = $values['identifiers'];
    }
}
