<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Redirect;

class RedirectXmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Redirect::fromXml('<Redirect method="method">text</Redirect>');
        $this->assertSame('text', $parsed->url);
        $this->assertSame('method', $parsed->method);
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('>text<', $serialized);
        $this->assertStringContainsString('method="method"', $serialized);
        $this->assertSame($serialized, Redirect::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Redirect::fromXml('<Redirect method="method" dataUnknown="1">text<Unknown a="1">v</Unknown></Redirect>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Redirect::fromXml($serialized)->toXml(false));
    }

    public function testToXmlEscapesSpecialCharacters(): void
    {
        $model = new Redirect(['url' => 'a & b < c > d "q" \'r\'', 'method' => 'method']);
        $serialized = $model->toXml(false);
        $this->assertStringNotContainsString('a & b', $serialized);
        $this->assertStringNotContainsString('< c', $serialized);
        $this->assertSame('a & b < c > d "q" \'r\'', Redirect::fromXml($serialized)->url);
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Redirect::fromXml('<NotTheRedirect/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Redirect::fromXml('<Redirect><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Redirect::fromXml('<!DOCTYPE Redirect [<!ENTITY xxe "injected">]><Redirect>&xxe;</Redirect>');
    }
}
