<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Response;

class ResponseXmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Response::fromXml('<Response><Say/></Response>');
        $serialized = $parsed->toXml(false);
        $this->assertSame($serialized, Response::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Response::fromXml('<Response dataUnknown="1"><Unknown a="1">v</Unknown></Response>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Response::fromXml($serialized)->toXml(false));
    }

    public function testFromXmlPreservesChildOrder(): void
    {
        $parsed = Response::fromXml('<Response><Say/><Pause/><Say/></Response>');
        $this->assertStringContainsString('<Say/><Pause/><Say/>', $parsed->toXml(false));
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Response::fromXml('<NotTheResponse/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Response::fromXml('<Response><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Response::fromXml('<!DOCTYPE Response [<!ENTITY xxe "injected">]><Response>&xxe;</Response>');
    }
}
