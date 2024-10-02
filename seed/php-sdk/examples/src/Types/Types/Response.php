<?php

namespace Seed\Types\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Types\Identifier;
use Seed\Core\Types\ArrayType;

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
