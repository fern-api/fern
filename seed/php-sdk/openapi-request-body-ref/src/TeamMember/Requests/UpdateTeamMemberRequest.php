<?php

namespace Seed\TeamMember\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UpdateTeamMemberRequest extends JsonSerializableType
{
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
     * @var ?string $emailAddress
     */
    #[JsonProperty('email_address')]
    public ?string $emailAddress;

    /**
     * @param array{
     *   givenName?: ?string,
     *   familyName?: ?string,
     *   emailAddress?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->givenName = $values['givenName'] ?? null;
        $this->familyName = $values['familyName'] ?? null;
        $this->emailAddress = $values['emailAddress'] ?? null;
    }
}
