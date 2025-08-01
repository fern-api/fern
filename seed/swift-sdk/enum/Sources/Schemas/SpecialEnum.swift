public enum SpecialEnum: String, Codable, Hashable, CaseIterable, Sendable {
    case a = ""
    case b = "Hello \"World\""
    case c = "Hello 'World'"
    case d = "Hello\\World"
    case e = "Hello\nWorld"
    case f = "Hello\rWorld"
    case h = "Hello\tWorld"
    case i = "Hello\u{000C}World"
    case j = "Hello\u{0008}World"
    case k = "Hello\u{000B}World"
    case l = "Hello\x00World"
    case m = "Hello\u{0007}World"
    case n = "Hello\u{0001}World"
    case o = "Hello\u{0002}World"
    case p = "Hello\u{001F}World"
    case q = "Hello\u{007F}World"
    case r = "Hello\u{009F}World"
    case s = "Line 1\n\"Quote\"\tTab\\Backslash\r\nLine 2\u{0000}Null"
    case t = "\n\r\t\x00\u{0008}\u{000C}\u{000B}\u{0007}"
    case u = "Hello 世界"
    case v = "café"
    case w = "🚀"
    case x = "\\n"
    case y = "\\"
    case z = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}"
    case aa = "SELECT * FROM users WHERE name = 'John O\\'Reilly'"
    case bb = "C:\\Users\\John\\Documents\\file.txt"
    case cc = "/usr/local/bin/app"
    case dd = "\\d{3}-\\d{2}-\\d{4}"
    case ee = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    case ff = "transcript[transcriptType=\"final\"]"
    case gg = "transcript[transcriptType='final']"
}