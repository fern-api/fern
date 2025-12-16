<?php

namespace Seed\Union;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ConvertToken extends JsonSerializableType
{
    /**
     * @var string $method
     */
    #[JsonProperty('method')]
    public string $method;

    /**
     * @var string $tokenId
     */
    #[JsonProperty('tokenId')]
    public string $tokenId;

    /**
     * @param array{
     *   method: string,
     *   tokenId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->method = $values['method'];
        $this->tokenId = $values['tokenId'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
