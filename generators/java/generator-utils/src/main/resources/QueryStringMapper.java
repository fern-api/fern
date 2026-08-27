import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import okhttp3.HttpUrl;
import okhttp3.MultipartBody;

public class QueryStringMapper {

    private static final ObjectMapper MAPPER = ObjectMappers.JSON_MAPPER;

    public static void addQueryParameter(HttpUrl.Builder httpUrl, String key, Object value, boolean arraysAsRepeats) {
        JsonNode valueNode = MAPPER.valueToTree(value);

        List<Map.Entry<String, JsonNode>> flat;
        if (valueNode.isObject()) {
            flat = flattenObject((ObjectNode) valueNode, arraysAsRepeats);
        } else if (valueNode.isArray()) {
            flat = flattenArray((ArrayNode) valueNode, "", arraysAsRepeats);
        } else {
            if (valueNode.isTextual()) {
                httpUrl.addQueryParameter(key, valueNode.textValue());
            } else {
                httpUrl.addQueryParameter(key, valueNode.toString());
            }
            return;
        }

        for (Map.Entry<String, JsonNode> field : flat) {
            // A map query parameter is exploded: every entry becomes its own parameter, keyed
            // by the property name alone. Arrays keep the parameter name, since their
            // flattened keys are indexes rather than property names, and a declared object
            // keeps it too so that only the dynamic case changes.
            String name = value instanceof java.util.Map ? explodedName(field.getKey()) : key + field.getKey();
            if (field.getValue().isTextual()) {
                httpUrl.addQueryParameter(name, field.getValue().textValue());
            } else {
                httpUrl.addQueryParameter(name, field.getValue().toString());
            }
        }
    }

    /**
     * Turns a flattened key into an exploded parameter name by unwrapping its first bracket:
     * {@code [category]} becomes {@code category} and {@code [a][b]} becomes {@code a[b]}.
     * Nested levels stay bracketed, which is the only sensible reading of an exploded object
     * whose values are themselves objects.
     */
    private static String explodedName(String flattenedKey) {
        if (!flattenedKey.startsWith("[")) {
            return flattenedKey;
        }
        int close = flattenedKey.indexOf(']');
        if (close < 0) {
            return flattenedKey;
        }
        return flattenedKey.substring(1, close) + flattenedKey.substring(close + 1);
    }

    public static void addFormDataPart(
            MultipartBody.Builder multipartBody, String key, Object value, boolean arraysAsRepeats) {
        JsonNode valueNode = MAPPER.valueToTree(value);

        List<Map.Entry<String, JsonNode>> flat;
        if (valueNode.isObject()) {
            flat = flattenObject((ObjectNode) valueNode, arraysAsRepeats);
        } else if (valueNode.isArray()) {
            flat = flattenArray((ArrayNode) valueNode, "", arraysAsRepeats);
        } else {
            if (valueNode.isTextual()) {
                multipartBody.addFormDataPart(key, valueNode.textValue());
            } else {
                multipartBody.addFormDataPart(key, valueNode.toString());
            }
            return;
        }

        for (Map.Entry<String, JsonNode> field : flat) {
            if (field.getValue().isTextual()) {
                multipartBody.addFormDataPart(
                        key + field.getKey(), field.getValue().textValue());
            } else {
                multipartBody.addFormDataPart(
                        key + field.getKey(), field.getValue().toString());
            }
        }
    }

    public static List<Map.Entry<String, JsonNode>> flattenObject(ObjectNode object, boolean arraysAsRepeats) {
        List<Map.Entry<String, JsonNode>> flat = new ArrayList<>();

        Iterator<Map.Entry<String, JsonNode>> fields = object.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();

            String key = "[" + field.getKey() + "]";

            if (field.getValue().isObject()) {
                List<Map.Entry<String, JsonNode>> flatField =
                        flattenObject((ObjectNode) field.getValue(), arraysAsRepeats);
                addAll(flat, flatField, key);
            } else if (field.getValue().isArray()) {
                List<Map.Entry<String, JsonNode>> flatField =
                        flattenArray((ArrayNode) field.getValue(), key, arraysAsRepeats);
                addAll(flat, flatField, "");
            } else {
                flat.add(new AbstractMap.SimpleEntry<>(key, field.getValue()));
            }
        }

        return flat;
    }

    private static List<Map.Entry<String, JsonNode>> flattenArray(
            ArrayNode array, String key, boolean arraysAsRepeats) {
        List<Map.Entry<String, JsonNode>> flat = new ArrayList<>();

        Iterator<JsonNode> elements = array.elements();

        int index = 0;
        while (elements.hasNext()) {
            JsonNode element = elements.next();

            String indexKey = key + "[" + index + "]";

            if (arraysAsRepeats) {
                indexKey = key;
            }

            if (element.isObject()) {
                List<Map.Entry<String, JsonNode>> flatField = flattenObject((ObjectNode) element, arraysAsRepeats);
                addAll(flat, flatField, indexKey);
            } else if (element.isArray()) {
                List<Map.Entry<String, JsonNode>> flatField = flattenArray((ArrayNode) element, "", arraysAsRepeats);
                addAll(flat, flatField, indexKey);
            } else {
                flat.add(new AbstractMap.SimpleEntry<>(indexKey, element));
            }

            index++;
        }

        return flat;
    }

    private static void addAll(
            List<Map.Entry<String, JsonNode>> target, List<Map.Entry<String, JsonNode>> source, String prefix) {
        for (Map.Entry<String, JsonNode> entry : source) {
            Map.Entry<String, JsonNode> entryToAdd =
                    new AbstractMap.SimpleEntry<>(prefix + entry.getKey(), entry.getValue());
            target.add(entryToAdd);
        }
    }
}
