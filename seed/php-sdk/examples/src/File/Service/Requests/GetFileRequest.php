<?php

namespace Seed\File\Service\Requests;

use Seed\Core\Json\SerializableType;

class GetFileRequest extends SerializableType
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
