<?php

namespace Seed\File\Service\Requests;

class GetFileRequest
{
    /**
     * @var string $xFileApiVersion
     */
    public string $xFileApiVersion;

    /**
     * @param string $xFileApiVersion
     */
    public function __construct(
        string $xFileApiVersion,
    ) {
        $this->xFileApiVersion = $xFileApiVersion;
    }
}
