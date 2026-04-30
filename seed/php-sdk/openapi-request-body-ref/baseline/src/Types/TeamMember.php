<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TeamMember extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?string $givenName
     */
    #[JsonProperty('given_name')]
    public ?string $givenName;

    /**
     * @var ?string $familyName
     */
    #[JsonProperty('family_name')]
    public ?string $familyName;

    /**
     * @param array{
     *   id: string,
     *   givenName?: ?string,
     *   familyName?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->givenName = $values['givenName'] ?? null;
        $this->familyName = $values['familyName'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
