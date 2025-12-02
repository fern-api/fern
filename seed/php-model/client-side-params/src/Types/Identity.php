<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Identity extends JsonSerializableType
{
    /**
     * @var string $connection
     */
    #[JsonProperty('connection')]
    public string $connection;

    /**
     * @var string $userId
     */
    #[JsonProperty('user_id')]
    public string $userId;

    /**
     * @var string $provider
     */
    #[JsonProperty('provider')]
    public string $provider;

    /**
     * @var bool $isSocial
     */
    #[JsonProperty('is_social')]
    public bool $isSocial;

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
     *   connection: string,
     *   userId: string,
     *   provider: string,
     *   isSocial: bool,
     *   accessToken?: ?string,
     *   expiresIn?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->connection = $values['connection'];$this->userId = $values['userId'];$this->provider = $values['provider'];$this->isSocial = $values['isSocial'];$this->accessToken = $values['accessToken'] ?? null;$this->expiresIn = $values['expiresIn'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
