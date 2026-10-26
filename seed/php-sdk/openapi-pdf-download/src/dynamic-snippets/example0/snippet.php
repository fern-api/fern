<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\AssetReportPdfGetRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->assetReport->getPdf(
    new AssetReportPdfGetRequest([
        'assetReportToken' => 'asset_report_token',
    ]),
);
