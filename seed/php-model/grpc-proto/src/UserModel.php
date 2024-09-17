<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UserModel extends SerializableType
{
    #[JsonProperty("username")]
    /**
     * @var ?string $username
     */
    public ?string $username;

    #[JsonProperty("email")]
    /**
     * @var ?string $email
     */
    public ?string $email;

    #[JsonProperty("age")]
    /**
     * @var ?int $age
     */
    public ?int $age;

    #[JsonProperty("weight")]
    /**
     * @var ?float $weight
     */
    public ?float $weight;

    #[JsonProperty("metadata")]
    /**
     * @var mixed $metadata
     */
    public mixed $metadata;

    /**
     * @param ?string $username
     * @param ?string $email
     * @param ?int $age
     * @param ?float $weight
     * @param mixed $metadata
     */
    public function __construct(
        ?string $username = null,
        ?string $email = null,
        ?int $age = null,
        ?float $weight = null,
        mixed $metadata,
    ) {
        $this->username = $username;
        $this->email = $email;
        $this->age = $age;
        $this->weight = $weight;
        $this->metadata = $metadata;
    }
}
