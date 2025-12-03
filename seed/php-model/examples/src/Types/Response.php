<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Identifier;
use Seed\Core\Types\ArrayType;

class Response extends JsonSerializableType
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
    )
    {
        $this->response = $values['response'];$this->identifiers = $values['identifiers'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
