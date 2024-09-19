<?php

namespace Seed\File\Service\Requests;

class GetFileRequest
{
    /**
     * @var string $xFileApiVersion
     */
    public string $xFileApiVersion;

    /**
     * @param array{
     *   xFileApiVersion: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->xFileApiVersion = $values['xFileApiVersion'];
    }
}
