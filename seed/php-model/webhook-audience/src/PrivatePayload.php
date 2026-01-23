<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PrivatePayload extends JsonSerializableType
{
    /**
     * @var string $secret
     */
    #[JsonProperty('secret')]
    public string $secret;

    /**
     * @param array{
     *   secret: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->secret = $values['secret'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
