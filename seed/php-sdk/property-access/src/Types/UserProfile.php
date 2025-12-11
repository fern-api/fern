<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * User profile object
 */
class UserProfile extends JsonSerializableType
{
    /**
     * @var string $name The name of the user.
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var UserProfileVerification $verification User profile verification object
     */
    #[JsonProperty('verification')]
    public UserProfileVerification $verification;

    /**
     * @var string $ssn The social security number of the user.
     */
    #[JsonProperty('ssn')]
    public string $ssn;

    /**
     * @param array{
     *   name: string,
     *   verification: UserProfileVerification,
     *   ssn: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->verification = $values['verification'];$this->ssn = $values['ssn'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
