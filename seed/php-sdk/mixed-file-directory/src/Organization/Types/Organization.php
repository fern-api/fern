<?php

namespace Seed\Organization\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\User\Types\User;

class Organization extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("users"), ArrayType([User::class])]
    /**
     * @var array<User> $users
     */
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
