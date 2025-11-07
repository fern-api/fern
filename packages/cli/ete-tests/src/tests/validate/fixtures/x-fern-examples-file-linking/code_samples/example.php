<?php
require_once(__DIR__ . '/vendor/autoload.php');

$client = new MyApiClient(['api_key' => 'YOUR_API_KEY']);
$response = $client->pets->list(['limit' => 10]);
print_r($response);
