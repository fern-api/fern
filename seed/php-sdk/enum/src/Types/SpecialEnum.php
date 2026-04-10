<?php

namespace Seed\Types;

enum SpecialEnum
 : string {
    case Empty = "";
    case HelloWorld = "Hello \\\"World\\\"";
    case HelloNWorld = "Hello\\nWorld";
    case HelloRWorld = "Hello\\rWorld";
    case HelloTWorld = "Hello\\tWorld";
    case HelloFWorld = "Hello\\fWorld";
    case HelloU0008World = "Hello\\u0008World";
    case HelloVWorld = "Hello\\vWorld";
    case HelloX00World = "Hello\\x00World";
    case HelloU0007World = "Hello\\u0007World";
    case HelloU0001World = "Hello\\u0001World";
    case HelloU0002World = "Hello\\u0002World";
    case HelloU001FWorld = "Hello\\u001FWorld";
    case HelloU007FWorld = "Hello\\u007FWorld";
    case HelloU009FWorld = "Hello\\u009FWorld";
    case Line1NQuoteTTabBackslashRnLine20Null = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null";
    case Nrtx00U0008Fvu0007 = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007";
    case Hello世界 = "Hello 世界";
    case Cafe = "café";
    case 🚀 = "🚀";
    case N = "\\\\n";
    case  = "\\\\";
    case NameJohnAge30CityNewYork = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}";
    case SelectFromUsersWhereNameJohnOReilly = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'";
    case CUsersJohnDocumentsFileTxt = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt";
    case UsrLocalBinApp = "/usr/local/bin/app";
    case D3D2D4 = "\\\\d{3}-\\\\d{2}-\\\\d{4}";
    case Azaz09Azaz09Azaz2 = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}";
    case TranscriptTranscriptTypeFinal = "transcript[transcriptType=\"final\"]";
}
