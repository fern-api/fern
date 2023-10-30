$form = new \API\Entities\Echo();
$form->setMessage("Hello World!");
try {
    $pet = $client->echo()->post($form);
} catch (UnprocessableEntityException $e) {
    var_dump($e->getErrors());
}
