<?php

namespace Seed\Tests\Core\Reflection;

class DeepTypeSetterAccessorsTest extends TestCase
{
    public function testSetNestedPropertyWithNull(): void
    {
        $object = new RootObjectAccessors();

        $this->assertNull($object->getLevel1());

        DeepTypeSetter::setDeep($object, ['level1', 'level2', 'level3'], 'testValue');

        $this->assertEquals('testValue', $object->getLevel1()?->getLevel2()?->getLevel3());
    }

    public function testSetNestedProperty(): void
    {
        $object = new RootObjectAccessors([
            "level1" => new Level1ObjectAccessors([
                "level2" => new Level2ObjectAccessors([
                    "level3" => null
                ])
            ])
        ]);

        $this->assertNull($object->getLevel1()?->getLevel2()?->getLevel3());

        DeepTypeSetter::setDeep($object, ['level1', 'level2', 'level3'], 'testValue');

        $this->assertEquals('testValue', $object->getLevel1()?->getLevel2()?->getLevel3());
    }

}