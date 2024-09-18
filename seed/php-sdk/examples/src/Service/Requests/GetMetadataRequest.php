<?php

namespace Seed\Service\Requests;

class GetMetadataRequest
{
    /**
     * @var string $xApiVersion
     */
    public string $xApiVersion;

    /**
     * @var array<?string> $tag
     */
    public array $tag;

    /**
     * @var ?bool $shallow
     */
    public ?bool $shallow;

    /**
     * @param string $xApiVersion
     * @param array<?string> $tag
     * @param ?bool $shallow
     */
    public function __construct(
        string $xApiVersion,
        array $tag,
        ?bool $shallow = null,
    ) {
        $this->xApiVersion = $xApiVersion;
        $this->tag = $tag;
        $this->shallow = $shallow;
    }
}
