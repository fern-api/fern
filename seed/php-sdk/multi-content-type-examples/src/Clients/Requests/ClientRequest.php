<?php

namespace Seed\Clients\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Client;
use Seed\Core\Json\JsonProperty;

class ClientRequest extends JsonSerializableType
{
    /**
     * @var ?Client $client
     */
    #[JsonProperty('client')]
    public ?Client $client;

    /**
     * @param array{
     *   client?: ?Client,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->client = $values['client'] ?? null;
    }
}
