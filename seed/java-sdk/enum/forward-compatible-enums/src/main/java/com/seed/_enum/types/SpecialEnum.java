/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed._enum.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public final class SpecialEnum {
    public static final SpecialEnum Q = new SpecialEnum(Value.Q, "Hello\\u007FWorld");

    public static final SpecialEnum BB = new SpecialEnum(Value.BB, "C:\\\\Users\\\\John\\\\Documents\\\\file.txt");

    public static final SpecialEnum CC = new SpecialEnum(Value.CC, "/usr/local/bin/app");

    public static final SpecialEnum Z =
            new SpecialEnum(Value.Z, "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}");

    public static final SpecialEnum D = new SpecialEnum(Value.D, "Hello\\\\World");

    public static final SpecialEnum I = new SpecialEnum(Value.I, "Hello\\fWorld");

    public static final SpecialEnum H = new SpecialEnum(Value.H, "Hello\\tWorld");

    public static final SpecialEnum L = new SpecialEnum(Value.L, "Hello\\x00World");

    public static final SpecialEnum E = new SpecialEnum(Value.E, "Hello\\nWorld");

    public static final SpecialEnum N = new SpecialEnum(Value.N, "Hello\\u0001World");

    public static final SpecialEnum X = new SpecialEnum(Value.X, "\\\\n");

    public static final SpecialEnum AA =
            new SpecialEnum(Value.AA, "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'");

    public static final SpecialEnum M = new SpecialEnum(Value.M, "Hello\\u0007World");

    public static final SpecialEnum O = new SpecialEnum(Value.O, "Hello\\u0002World");

    public static final SpecialEnum F = new SpecialEnum(Value.F, "Hello\\rWorld");

    public static final SpecialEnum FF = new SpecialEnum(Value.FF, "transcript[transcriptType=\"final\"]");

    public static final SpecialEnum DD = new SpecialEnum(Value.DD, "\\\\d{3}-\\\\d{2}-\\\\d{4}");

    public static final SpecialEnum K = new SpecialEnum(Value.K, "Hello\\vWorld");

    public static final SpecialEnum V = new SpecialEnum(Value.V, "café");

    public static final SpecialEnum J = new SpecialEnum(Value.J, "Hello\\u0008World");

    public static final SpecialEnum W = new SpecialEnum(Value.W, "🚀");

    public static final SpecialEnum GG = new SpecialEnum(Value.GG, "transcript[transcriptType='final']");

    public static final SpecialEnum U = new SpecialEnum(Value.U, "Hello 世界");

    public static final SpecialEnum P = new SpecialEnum(Value.P, "Hello\\u001FWorld");

    public static final SpecialEnum B = new SpecialEnum(Value.B, "Hello \\\"World\\\"");

    public static final SpecialEnum C = new SpecialEnum(Value.C, "Hello 'World'");

    public static final SpecialEnum R = new SpecialEnum(Value.R, "Hello\\u009FWorld");

    public static final SpecialEnum A = new SpecialEnum(Value.A, "");

    public static final SpecialEnum Y = new SpecialEnum(Value.Y, "\\\\");

    public static final SpecialEnum EE = new SpecialEnum(Value.EE, "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}");

    public static final SpecialEnum S =
            new SpecialEnum(Value.S, "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null");

    public static final SpecialEnum T = new SpecialEnum(Value.T, "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007");

    private final Value value;

    private final String string;

    SpecialEnum(Value value, String string) {
        this.value = value;
        this.string = string;
    }

    public Value getEnumValue() {
        return value;
    }

    @java.lang.Override
    @JsonValue
    public String toString() {
        return this.string;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        return (this == other) || (other instanceof SpecialEnum && this.string.equals(((SpecialEnum) other).string));
    }

    @java.lang.Override
    public int hashCode() {
        return this.string.hashCode();
    }

    public <T> T visit(Visitor<T> visitor) {
        switch (value) {
            case Q:
                return visitor.visitQ();
            case BB:
                return visitor.visitBb();
            case CC:
                return visitor.visitCc();
            case Z:
                return visitor.visitZ();
            case D:
                return visitor.visitD();
            case I:
                return visitor.visitI();
            case H:
                return visitor.visitH();
            case L:
                return visitor.visitL();
            case E:
                return visitor.visitE();
            case N:
                return visitor.visitN();
            case X:
                return visitor.visitX();
            case AA:
                return visitor.visitAa();
            case M:
                return visitor.visitM();
            case O:
                return visitor.visitO();
            case F:
                return visitor.visitF();
            case FF:
                return visitor.visitFf();
            case DD:
                return visitor.visitDd();
            case K:
                return visitor.visitK();
            case V:
                return visitor.visitV();
            case J:
                return visitor.visitJ();
            case W:
                return visitor.visitW();
            case GG:
                return visitor.visitGg();
            case U:
                return visitor.visitU();
            case P:
                return visitor.visitP();
            case B:
                return visitor.visitB();
            case C:
                return visitor.visitC();
            case R:
                return visitor.visitR();
            case A:
                return visitor.visitA();
            case Y:
                return visitor.visitY();
            case EE:
                return visitor.visitEe();
            case S:
                return visitor.visitS();
            case T:
                return visitor.visitT();
            case UNKNOWN:
            default:
                return visitor.visitUnknown(string);
        }
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static SpecialEnum valueOf(String value) {
        switch (value) {
            case "Hello\\u007FWorld":
                return Q;
            case "C:\\\\Users\\\\John\\\\Documents\\\\file.txt":
                return BB;
            case "/usr/local/bin/app":
                return CC;
            case "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}":
                return Z;
            case "Hello\\\\World":
                return D;
            case "Hello\\fWorld":
                return I;
            case "Hello\\tWorld":
                return H;
            case "Hello\\x00World":
                return L;
            case "Hello\\nWorld":
                return E;
            case "Hello\\u0001World":
                return N;
            case "\\\\n":
                return X;
            case "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'":
                return AA;
            case "Hello\\u0007World":
                return M;
            case "Hello\\u0002World":
                return O;
            case "Hello\\rWorld":
                return F;
            case "transcript[transcriptType=\"final\"]":
                return FF;
            case "\\\\d{3}-\\\\d{2}-\\\\d{4}":
                return DD;
            case "Hello\\vWorld":
                return K;
            case "café":
                return V;
            case "Hello\\u0008World":
                return J;
            case "🚀":
                return W;
            case "transcript[transcriptType='final']":
                return GG;
            case "Hello 世界":
                return U;
            case "Hello\\u001FWorld":
                return P;
            case "Hello \\\"World\\\"":
                return B;
            case "Hello 'World'":
                return C;
            case "Hello\\u009FWorld":
                return R;
            case "":
                return A;
            case "\\\\":
                return Y;
            case "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}":
                return EE;
            case "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null":
                return S;
            case "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007":
                return T;
            default:
                return new SpecialEnum(Value.UNKNOWN, value);
        }
    }

    public enum Value {
        A,

        B,

        C,

        D,

        E,

        F,

        H,

        I,

        J,

        K,

        L,

        M,

        N,

        O,

        P,

        Q,

        R,

        S,

        T,

        U,

        V,

        W,

        X,

        Y,

        Z,

        AA,

        BB,

        CC,

        DD,

        EE,

        FF,

        GG,

        UNKNOWN
    }

    public interface Visitor<T> {
        T visitA();

        T visitB();

        T visitC();

        T visitD();

        T visitE();

        T visitF();

        T visitH();

        T visitI();

        T visitJ();

        T visitK();

        T visitL();

        T visitM();

        T visitN();

        T visitO();

        T visitP();

        T visitQ();

        T visitR();

        T visitS();

        T visitT();

        T visitU();

        T visitV();

        T visitW();

        T visitX();

        T visitY();

        T visitZ();

        T visitAa();

        T visitBb();

        T visitCc();

        T visitDd();

        T visitEe();

        T visitFf();

        T visitGg();

        T visitUnknown(String unknownType);
    }
}
