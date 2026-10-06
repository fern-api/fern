import okhttp3.HttpUrl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public final class PathSegmentsTest {

    @Test
    public void testRejectsDotSegments() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> PathSegments.validate("."));
        Assertions.assertThrows(IllegalArgumentException.class, () -> PathSegments.validate(".."));
    }

    @Test
    public void testAllowsValuesContainingDots() {
        Assertions.assertEquals("...", PathSegments.validate("..."));
        Assertions.assertEquals("v1.2", PathSegments.validate("v1.2"));
        Assertions.assertEquals("../plants", PathSegments.validate("../plants"));
    }

    @Test
    public void testValueStaysWithinOneSegment() {
        HttpUrl url = HttpUrl.parse("https://api.example.com")
                .newBuilder()
                .addPathSegments("plants")
                .addPathSegment(PathSegments.validate("../leaves?x#y"))
                .addPathSegments("leaves")
                .addPathSegment(PathSegments.validate("L1"))
                .build();
        Assertions.assertEquals("/plants/..%2Fleaves%3Fx%23y/leaves/L1", url.encodedPath());
    }
}
