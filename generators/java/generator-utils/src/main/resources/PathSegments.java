public final class PathSegments {

    private PathSegments() {}

    /**
     * Returns the value unchanged, rejecting "." and "..". These are dot-segments that URL builders resolve,
     * which would otherwise change the endpoint a request is sent to.
     */
    public static String validate(String value) {
        if (".".equals(value) || "..".equals(value)) {
            throw new IllegalArgumentException(
                    "Invalid path parameter value \"" + value + "\": \".\" and \"..\" are not allowed.");
        }
        return value;
    }
}
