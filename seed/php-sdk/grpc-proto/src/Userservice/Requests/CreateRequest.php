<?php

namespace Seed\Userservice\Requests;

use Seed\Core\JsonProperty;

class CreateRequest
{
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
     * @var mixed $metadata
     */
    #[JsonProperty("metadata")]
    public mixed $metadata;

}
