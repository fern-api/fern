<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * User object
 */
class User extends JsonSerializableType
{
    /**
     * @var string $id The unique identifier for the user.
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $email The email address of the user.
     */
    #[JsonProperty('email')]
    public string $email;

    /**
     * @var string $password The password for the user.
     */
    #[JsonProperty('password')]
    public string $password;

    /**
     * @var UserProfile $profile User profile object
     */
    #[JsonProperty('profile')]
    public UserProfile $profile;

    /**
     * @param array{
     *   id: string,
     *   email: string,
     *   password: string,
     *   profile: UserProfile,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->email = $values['email'];$this->password = $values['password'];$this->profile = $values['profile'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
