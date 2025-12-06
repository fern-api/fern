<?php

namespace Seed\Nullable\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUsersRequest extends JsonSerializableType
{
    /**
     * @var ?array<string> $usernames
     */
    public ?array $usernames;

    /**
     * @var ?string $avatar
     */
    public ?string $avatar;

    /**
     * @var ?array<bool> $activated
     */
    public ?array $activated;

    /**
     * @var ?array<?string> $tags
     */
    public ?array $tags;

    /**
     * @var ?bool $extra
     */
    public ?bool $extra;

    /**
     * @param array{
     *   usernames?: ?array<string>,
     *   avatar?: ?string,
     *   activated?: ?array<bool>,
     *   tags?: ?array<?string>,
     *   extra?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->usernames = $values['usernames'] ?? null;$this->avatar = $values['avatar'] ?? null;$this->activated = $values['activated'] ?? null;$this->tags = $values['tags'] ?? null;$this->extra = $values['extra'] ?? null;
    }
}
