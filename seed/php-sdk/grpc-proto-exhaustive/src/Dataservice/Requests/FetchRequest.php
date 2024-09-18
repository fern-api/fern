<?php

namespace Seed\Dataservice\Requests;

class FetchRequest
{
    /**
     * @var array<?string> $ids
     */
    public array $ids;

    /**
     * @var ?string $namespace
     */
    public ?string $namespace;

}
