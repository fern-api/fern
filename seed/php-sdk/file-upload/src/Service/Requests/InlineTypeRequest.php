<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Service\Types\MyInlineType;
use Seed\Core\Json\JsonProperty;

class InlineTypeRequest extends JsonSerializableType
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @var MyInlineType $request
     */
    #[JsonProperty('request')]
    public MyInlineType $request;

    /**
     * @param array{
     *   file: File,
     *   request: MyInlineType,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->file = $values['file'];$this->request = $values['request'];
    }
}
