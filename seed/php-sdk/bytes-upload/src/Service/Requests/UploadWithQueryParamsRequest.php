<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class UploadWithQueryParamsRequest extends JsonSerializableType
{
    /**
     * @var string $model The model to use for processing
     */
    public string $model;

    /**
     * @var ?string $language The language of the content
     */
    public ?string $language;

    /**
     * @param array{
     *   model: string,
     *   language?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->model = $values['model'];
        $this->language = $values['language'] ?? null;
    }
}
