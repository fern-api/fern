# frozen_string_literal: true

module SeedEnumClient
  class SpecialEnum

    A = ""
    B = "Hello \"World\""
    C = "Hello 'World'"
    D = "Hello\\World"
    E = "Hello\nWorld"
    F = "Hello\rWorld"
    H = "Hello\tWorld"
    I = "Hello\fWorld"
    J = "Hello\u0008World"
    K = "Hello\vWorld"
    L = "Hello\0World"
    M = "Hello\u0007World"
    N = "Hello\u0001World"
    O = "Hello\u0002World"
    P = "Hello\u001FWorld"
    Q = "Hello\u007FWorld"
    R = "Hello\u009FWorld"
    S = "Line 1\n"Quote"\tTab\\Backslash\r\nLine 2\0Null"
    T = "\n\r\t\0\u0008\f\v\u0007"
    U = "Hello 世界"
    V = "café"
    W = "🚀"
    X = "\\n"
    Y = "\\"
    Z = "{"name": "John", "age": 30, "city": "New York"}"
    AA = "SELECT * FROM users WHERE name = 'John O\\'Reilly'"
    BB = "C:\\Users\\John\\Documents\\file.txt"
    CC = "/usr/local/bin/app"
    DD = "\\d{3}-\\d{2}-\\d{4}"
    EE = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    FF = "transcript[transcriptType="final"]"
    GG = "transcript[transcriptType='final']"

  end
end