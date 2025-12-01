<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * User profile verification object
 */
class UserProfileVerification extends JsonSerializableType
{
    /**
     * @var string $verified User profile verification status
     */
    #[JsonProperty('verified')]
    public string $verified;

    /**
     * @param array{
     *   verified: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->verified = $values['verified'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
