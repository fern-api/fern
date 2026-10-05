<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class AssetReportPdfGetRequest extends JsonSerializableType
{
    /**
     * @var string $assetReportToken
     */
    #[JsonProperty('asset_report_token')]
    public string $assetReportToken;

    /**
     * @param array{
     *   assetReportToken: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->assetReportToken = $values['assetReportToken'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
