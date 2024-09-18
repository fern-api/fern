<?php

namespace Seed\Service\Requests;

class GetMetadataRequest
{
    /**
     * @var ?bool $shallow
     */
    public ?bool $shallow;

    /**
     * @var array<?string> $tag
     */
    public array $tag;

    /**
     * @var string $xApiVersion
     */
    public string $xApiVersion;

}
