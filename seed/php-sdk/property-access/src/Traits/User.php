<?php

namespace Seed\Traits;

use Seed\Types\UserProfile;
use Seed\Core\Json\JsonProperty;

/**
 * User object
 *
 * @property string $id
 * @property string $email
 * @property string $password
 * @property UserProfile $profile
 */
trait User 
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
}
