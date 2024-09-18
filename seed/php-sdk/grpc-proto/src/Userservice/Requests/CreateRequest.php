<?php

namespace Seed\Userservice\Requests;

use Seed\Core\JsonProperty;

class CreateRequest
{
    /**
     * @var mixed $metadata
     */
    #[JsonProperty("metadata")]
    public mixed $metadata;

    /**
     * @var ?string $username
     */
    #[JsonProperty("username")]
    public ?string $username;

    /**
     * @var ?string $email
     */
    #[JsonProperty("email")]
    public ?string $email;

    /**
     * @var ?int $age
     */
    #[JsonProperty("age")]
    public ?int $age;

    /**
     * @var ?float $weight
     */
    #[JsonProperty("weight")]
    public ?float $weight;

    /**
     * @param mixed $metadata
     * @param ?string $username
     * @param ?string $email
     * @param ?int $age
     * @param ?float $weight
     */
    public function __construct(
        mixed $metadata,
        ?string $username = null,
        ?string $email = null,
        ?int $age = null,
        ?float $weight = null,
    ) {
        $this->metadata = $metadata;
        $this->username = $username;
        $this->email = $email;
        $this->age = $age;
        $this->weight = $weight;
    }
}
