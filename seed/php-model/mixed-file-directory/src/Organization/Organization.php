<?php

namespace Seed\Organization;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\User\User;
use Seed\Core\ArrayType;

class Organization extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var array<User> $users
     */
    #[JsonProperty("users"), ArrayType([User::class])]
    public array $users;

    /**
     * @param string $id
     * @param string $name
     * @param array<User> $users
     */
    public function __construct(
        string $id,
        string $name,
        array $users,
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->users = $users;
    }
}
