<?php

namespace Seed\Traits;

use Seed\Types\InlineUsersUserListContainer;
use Seed\Core\Json\JsonProperty;

/**
 * @property InlineUsersUserListContainer $data
 * @property ?string $next
 */
trait InlineUsersUserPage
{
    /**
     * @var InlineUsersUserListContainer $data
     */
    #[JsonProperty('data')]
    public InlineUsersUserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;
}
