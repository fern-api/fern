<?php

namespace Seed\Users\Traits;

use Seed\Users\UserListContainer;
use Seed\Core\Json\JsonProperty;

trait UserPage
{
    /**
     * @var UserListContainer $data
     */
    #[JsonProperty('data')]
    public UserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;
}
