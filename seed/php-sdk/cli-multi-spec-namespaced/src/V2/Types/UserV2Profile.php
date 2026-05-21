<?php

namespace Seed\V2\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UserV2Profile extends JsonSerializableType
{
    /**
     * @var ?string $email
     */
    #[JsonProperty('email')]
    public ?string $email;

    /**
     * @var ?string $displayName
     */
    #[JsonProperty('displayName')]
    public ?string $displayName;

    /**
     * @param array{
     *   email?: ?string,
     *   displayName?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->email = $values['email'] ?? null;
        $this->displayName = $values['displayName'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
