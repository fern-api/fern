<?php

namespace Seed;

enum SpecialEnum
 : string {
    case A = "";
    case B = "Hello \\\"World\\\"";
    case C = "Hello 'World'";
    case D = "Hello\\\\World";
    case E = "Hello\\nWorld";
    case F = "Hello\\rWorld";
    case H = "Hello\\tWorld";
    case I = "Hello\\fWorld";
    case J = "Hello\\u0008World";
    case K = "Hello\\vWorld";
    case L = "Hello\\x00World";
    case M = "Hello\\u0007World";
    case N = "Hello\\u0001World";
    case O = "Hello\\u0002World";
    case P = "Hello\\u001FWorld";
    case Q = "Hello\\u007FWorld";
    case R = "Hello\\u009FWorld";
    case S = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null";
    case T = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007";
    case U = "Hello 世界";
    case V = "café";
    case W = "🚀";
    case X = "\\\\n";
    case Y = "\\\\";
    case Z = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}";
    case Aa = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'";
    case Bb = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt";
    case Cc = "/usr/local/bin/app";
    case Dd = "\\\\d{3}-\\\\d{2}-\\\\d{4}";
    case Ee = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}";
    case Ff = "transcript[transcriptType=\"final\"]";
    case Gg = "transcript[transcriptType='final']";
}
