import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import okhttp3.HttpUrl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public final class QueryStringMapperTest {
    @Test
    public void testObjectWithQuotedString_indexedArrays() {
        Map<String, String> map = new HashMap<String, String>() {
            {
                put("hello", "\"world\"");
            }
        };

        String expectedQueryString = "withquoted%5Bhello%5D=%22world%22";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("withquoted", map);
                    }
                },
                false);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObjectWithQuotedString_arraysAsRepeats() {
        Map<String, String> map = new HashMap<String, String>() {
            {
                put("hello", "\"world\"");
            }
        };

        String expectedQueryString = "withquoted%5Bhello%5D=%22world%22";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("withquoted", map);
                    }
                },
                true);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObject_indexedArrays() {
        Map<String, String> map = new HashMap<String, String>() {
            {
                put("foo", "bar");
                put("baz", "qux");
            }
        };

        String expectedQueryString = "metadata%5Bfoo%5D=bar&metadata%5Bbaz%5D=qux";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("metadata", map);
                    }
                },
                false);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObject_arraysAsRepeats() {
        Map<String, String> map = new HashMap<String, String>() {
            {
                put("foo", "bar");
                put("baz", "qux");
            }
        };

        String expectedQueryString = "metadata%5Bfoo%5D=bar&metadata%5Bbaz%5D=qux";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("metadata", map);
                    }
                },
                true);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testNestedObject_indexedArrays() {
        Map<String, Map<String, String>> nestedMap = new HashMap<String, Map<String, String>>() {
            {
                put("mapkey1", new HashMap<String, String>() {
                    {
                        put("mapkey1mapkey1", "mapkey1mapkey1value");
                        put("mapkey1mapkey2", "mapkey1mapkey2value");
                    }
                });
                put("mapkey2", new HashMap<String, String>() {
                    {
                        put("mapkey2mapkey1", "mapkey2mapkey1value");
                    }
                });
            }
        };

        String expectedQueryString =
                "nested%5Bmapkey2%5D%5Bmapkey2mapkey1%5D=mapkey2mapkey1value&nested%5Bmapkey1%5D%5Bmapkey1mapkey1"
                        + "%5D=mapkey1mapkey1value&nested%5Bmapkey1%5D%5Bmapkey1mapkey2%5D=mapkey1mapkey2value";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("nested", nestedMap);
                    }
                },
                false);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testNestedObject_arraysAsRepeats() {
        Map<String, Map<String, String>> nestedMap = new HashMap<String, Map<String, String>>() {
            {
                put("mapkey1", new HashMap<String, String>() {
                    {
                        put("mapkey1mapkey1", "mapkey1mapkey1value");
                        put("mapkey1mapkey2", "mapkey1mapkey2value");
                    }
                });
                put("mapkey2", new HashMap<String, String>() {
                    {
                        put("mapkey2mapkey1", "mapkey2mapkey1value");
                    }
                });
            }
        };

        String expectedQueryString =
                "nested%5Bmapkey2%5D%5Bmapkey2mapkey1%5D=mapkey2mapkey1value&nested%5Bmapkey1%5D%5Bmapkey1mapkey1"
                        + "%5D=mapkey1mapkey1value&nested%5Bmapkey1%5D%5Bmapkey1mapkey2%5D=mapkey1mapkey2value";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("nested", nestedMap);
                    }
                },
                true);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testDateTime_indexedArrays() {
        OffsetDateTime dateTime =
                OffsetDateTime.ofInstant(Instant.ofEpochSecond(1740412107L), ZoneId.of("America/New_York"));

        String expectedQueryString = "datetime=2025-02-24T10%3A48%3A27-05%3A00";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("datetime", dateTime);
                    }
                },
                false);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testDateTime_arraysAsRepeats() {
        OffsetDateTime dateTime =
                OffsetDateTime.ofInstant(Instant.ofEpochSecond(1740412107L), ZoneId.of("America/New_York"));

        String expectedQueryString = "datetime=2025-02-24T10%3A48%3A27-05%3A00";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("datetime", dateTime);
                    }
                },
                true);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObjectArray_indexedArrays() {
        List<Map<String, String>> mapArray = new ArrayList<Map<String, String>>() {
            {
                add(new HashMap<String, String>() {
                    {
                        put("key", "hello");
                        put("value", "world");
                    }
                });
                add(new HashMap<String, String>() {
                    {
                        put("key", "foo");
                        put("value", "bar");
                    }
                });
                add(new HashMap<>());
            }
        };

        String expectedQueryString = "objects%5B0%5D%5Bvalue%5D=world&objects%5B0%5D%5Bkey%5D=hello&objects%5B1%5D"
                + "%5Bvalue%5D=bar&objects%5B1%5D%5Bkey%5D=foo";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("objects", mapArray);
                    }
                },
                false);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObjectArray_arraysAsRepeats() {
        List<Map<String, String>> mapArray = new ArrayList<Map<String, String>>() {
            {
                add(new HashMap<String, String>() {
                    {
                        put("key", "hello");
                        put("value", "world");
                    }
                });
                add(new HashMap<String, String>() {
                    {
                        put("key", "foo");
                        put("value", "bar");
                    }
                });
                add(new HashMap<>());
            }
        };

        String expectedQueryString =
                "objects%5Bvalue%5D=world&objects%5Bkey%5D=hello&objects%5Bvalue" + "%5D=bar&objects%5Bkey%5D=foo";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("objects", mapArray);
                    }
                },
                true);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObjectWithArray_indexedArrays() {
        Map<String, Object> objectWithArray = new HashMap<String, Object>() {
            {
                put("id", "abc123");
                put("contactIds", new ArrayList<String>() {
                    {
                        add("id1");
                        add("id2");
                        add("id3");
                    }
                });
            }
        };

        String expectedQueryString =
                "objectwitharray%5Bid%5D=abc123&objectwitharray%5BcontactIds%5D%5B0%5D=id1&objectwitharray"
                        + "%5BcontactIds%5D%5B1%5D=id2&objectwitharray%5BcontactIds%5D%5B2%5D=id3";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("objectwitharray", objectWithArray);
                    }
                },
                false);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    @Test
    public void testObjectWithArray_arraysAsRepeats() {
        Map<String, Object> objectWithArray = new HashMap<String, Object>() {
            {
                put("id", "abc123");
                put("contactIds", new ArrayList<String>() {
                    {
                        add("id1");
                        add("id2");
                        add("id3");
                    }
                });
            }
        };

        String expectedQueryString = "objectwitharray%5Bid%5D=abc123&objectwitharray%5BcontactIds"
                + "%5D=id1&objectwitharray%5BcontactIds%5D=id2&objectwitharray%5BcontactIds%5D=id3";

        String actualQueryString = queryString(
                new HashMap<String, Object>() {
                    {
                        put("objectwitharray", objectWithArray);
                    }
                },
                true);

        Assertions.assertEquals(expectedQueryString, actualQueryString);
    }

    private static String queryString(Map<String, Object> params, boolean arraysAsRepeats) {
        HttpUrl.Builder httpUrl = HttpUrl.parse("http://www.fakewebsite.com/").newBuilder();
        params.forEach((paramName, paramValue) ->
                QueryStringMapper.addQueryParameter(httpUrl, paramName, paramValue, arraysAsRepeats));
        return httpUrl.build().encodedQuery();
    }
}
