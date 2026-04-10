<?php

namespace Seed\Traits;

use Seed\Types\InlineUsersUserOptionalListContainer;
use Seed\Core\Json\JsonProperty;

/**
 * @property InlineUsersUserOptionalListContainer $data
 * @property ?string $next
 */
trait InlineUsersUserOptionalListPage
{
    /**
     * @var InlineUsersUserOptionalListContainer $data
     */
    #[JsonProperty('data')]
    public InlineUsersUserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;
}
