<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ClientResponse extends JsonSerializableType
{
    /**
     * @var ?ClientWithId $client
     */
    #[JsonProperty('client')]
    public ?ClientWithId $client;

    /**
     * @param array{
     *   client?: ?ClientWithId,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->client = $values['client'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
