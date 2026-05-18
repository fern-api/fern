/**
 * Tests that union members named 'Type' or 'Value' don't collide with internal properties
 */
export type UnionWithReservedNames = "type" | "value" | string;
