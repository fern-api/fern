<?php

namespace Seed\File\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetFileRequest extends JsonSerializableType
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
    )
    {
        $this->xFileApiVersion = $values['xFileApiVersion'];
    }
}
