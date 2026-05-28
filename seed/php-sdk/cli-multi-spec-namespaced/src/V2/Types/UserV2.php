<?php

namespace Seed\V2\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UserV2 extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var UserV2Profile $profile
     */
    #[JsonProperty('profile')]
    public UserV2Profile $profile;

    /**
     * @param array{
     *   id: string,
     *   profile: UserV2Profile,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->profile = $values['profile'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
