<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;

class Person extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @var string|null $email
     */
    #[JsonProperty('email')]
    private ?string $email;

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * @param array{
     *   name: string,
     *   email?: string|null,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];
        $this->email = $values['email'] ?? null;
    }
}

class AdditionalPropertiesTest extends TestCase
{
    public function testExtraProperties(): void
    {
        $expectedJson = json_encode(
            [
                'name' => 'john.doe',
                'email' => 'john.doe@example.com',
                'age' => 42
            ],
            JSON_THROW_ON_ERROR
        );

        $person = Person::fromJson($expectedJson);
        $this->assertEquals('john.doe', $person->getName());
        $this->assertEquals('john.doe@example.com', $person->getEmail());
        $this->assertEquals([
            'age' => 42
        ],
            $person->getAdditionalProperties(),
        );
    }
}