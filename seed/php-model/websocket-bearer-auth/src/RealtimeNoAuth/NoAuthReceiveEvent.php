<?php

namespace Seed\RealtimeNoAuth;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NoAuthReceiveEvent extends JsonSerializableType
{
    /**
     * @var string $response
     */
    #[JsonProperty('response')]
    public string $response;

    /**
     * @param array{
     *   response: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->response = $values['response'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
