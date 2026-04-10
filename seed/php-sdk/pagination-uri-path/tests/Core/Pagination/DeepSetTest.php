<?php

namespace Seed\Tests\Core\Pagination;

use PHPUnit\Framework\TestCase;
use Seed\Core\Pagination\PaginationHelper;

class RootObject
{
    public ?Level1Object $level1;

    /**
     * @param ?array{
     *     level1?: ?Level1Object,
     * } $data
     */
    public function __construct(?array $data = [])
    {
        $this->level1 = $data['level1'] ?? null;
    }
}

class Level1Object
{
    public ?Level2Object $level2;

    /**
     * @param ?array{
     *     level2?: ?Level2Object,
     * } $data
     */
    public function __construct(?array $data = [])
    {
        $this->level2 = $data['level2'] ?? null;
    }
}

class Level2Object
{
    public ?string $level3;

    /**
     * @param ?array{
     *     level3?: ?string,
     * } $data
     */
    public function __construct(?array $data = [])
    {
        $this->level3 = $data['level3'] ?? null;
    }
}

class DeepSetTest extends TestCase
{
    public function testSetNestedPropertyWithNull(): void
    {
        $object = new RootObject();

        $this->assertNull($object->level1);

        PaginationHelper::setDeep($object, ['level1', 'level2', 'level3'], 'testValue');

        $this->assertEquals('testValue', $object->level1?->level2?->level3);
    }

    public function testSetNestedProperty(): void
    {
        $object = new RootObject([
            "level1" => new Level1Object([
                "level2" => new Level2Object([
                    "level3" => null
                ])
            ])
        ]);

        $this->assertNull($object->level1?->level2?->level3);

        PaginationHelper::setDeep($object, ['level1', 'level2', 'level3'], 'testValue');

        $this->assertEquals('testValue', $object->level1?->level2?->level3);
    }

}
