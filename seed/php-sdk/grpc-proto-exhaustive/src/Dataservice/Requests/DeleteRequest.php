<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DeleteRequest
{
    /**
     * @var ?array<string> $ids
     */
    #[JsonProperty("ids"), ArrayType(["string"])]
    public ?array $ids;

    /**
     * @var ?bool $deleteAll
     */
    #[JsonProperty("deleteAll")]
    public ?bool $deleteAll;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

    /**
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

}
