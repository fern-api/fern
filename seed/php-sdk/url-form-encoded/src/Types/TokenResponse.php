<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TokenResponse extends JsonSerializableType
{
    /**
     * @var ?string $accessToken
     */
    #[JsonProperty('access_token')]
    public ?string $accessToken;

    /**
     * @var ?int $expiresIn
     */
    #[JsonProperty('expires_in')]
    public ?int $expiresIn;

    /**
     * @param array{
     *   accessToken?: ?string,
     *   expiresIn?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->accessToken = $values['accessToken'] ?? null;
        $this->expiresIn = $values['expiresIn'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
