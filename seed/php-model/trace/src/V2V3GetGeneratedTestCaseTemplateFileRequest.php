<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2V3GetGeneratedTestCaseTemplateFileRequest extends JsonSerializableType
{
    /**
     * @var V2V3TestCaseTemplate $template
     */
    #[JsonProperty('template')]
    public V2V3TestCaseTemplate $template;

    /**
     * @param array{
     *   template: V2V3TestCaseTemplate,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->template = $values['template'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
