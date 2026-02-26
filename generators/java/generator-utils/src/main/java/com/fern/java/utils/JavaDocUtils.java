package com.fern.java.utils;

import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.TypeName;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;
import org.commonmark.node.Paragraph;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.Renderer;
import org.commonmark.renderer.html.CoreHtmlNodeRenderer;
import org.commonmark.renderer.html.HtmlRenderer;

public final class JavaDocUtils {

    private static final Parser PARSER = Parser.builder().build();
    private static final Renderer DEFAULT_RENDERER =
            HtmlRenderer.builder().escapeHtml(true).build();

    private static final Renderer RENDERER_WITHOUT_OUTER_PARAGRAPH_TAGS = HtmlRenderer.builder()
            .escapeHtml(true)
            .nodeRendererFactory(context -> new CoreHtmlNodeRenderer(context) {
                private boolean firstParagraph = true;

                @Override
                public void visit(Paragraph paragraph) {
                    // Exclude the first set of paragraph tags for javadoc style.
                    if (firstParagraph) {
                        firstParagraph = false;
                        visitChildren(paragraph);
                    } else {
                        super.visit(paragraph);
                    }
                }
            })
            .build();

    // HTML tags that are safe to preserve in Javadoc comments.
    // Reference: Checkstyle JavadocStyle allowed tags + common HTML5 additions.
    // https://checkstyle.sourceforge.io/checks/javadoc/javadocstyle.html
    private static final Set<String> SAFE_JAVADOC_TAGS = Set.of(
            // Inline formatting
            "a",
            "abbr",
            "acronym",
            "b",
            "bdo",
            "big",
            "br",
            "cite",
            "code",
            "dfn",
            "em",
            "font",
            "i",
            "ins",
            "kbd",
            "q",
            "s",
            "samp",
            "small",
            "span",
            "strong",
            "sub",
            "sup",
            "tt",
            "u",
            "var",
            // Block formatting
            "address",
            "blockquote",
            "del",
            "div",
            "fieldset",
            "hr",
            "p",
            "pre",
            // Lists
            "dd",
            "dl",
            "dt",
            "li",
            "ol",
            "ul",
            // Tables
            "area",
            "caption",
            "colgroup",
            "table",
            "tbody",
            "td",
            "tfoot",
            "th",
            "thead",
            "tr",
            // Headings
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            // Media
            "img");

    // Matches escaped HTML tags in CommonMark output: &lt;tagName attrs /&gt;
    // Group 1: full tag opening (optional slash + tag name), e.g. "a" or "/a"
    // Group 2: tag name only, e.g. "a"
    // Group 3: attributes (may contain &quot; and other entities)
    // Group 4: optional self-closing slash
    private static final Pattern ESCAPED_TAG =
            Pattern.compile("&lt;(/?([a-zA-Z][a-zA-Z0-9]*))((?:[^&]|&(?!gt;))*?)(/?)&gt;");

    public static String render(String docs) {
        return render(docs, false);
    }

    public static String render(String docs, boolean excludeOuterParagraphTags) {
        String rawDocs = StringUtils.stripToEmpty(docs).replace("$", "$$");
        if (StringUtils.isBlank(rawDocs)) {
            return "";
        }
        String renderedHtml = excludeOuterParagraphTags
                ? RENDERER_WITHOUT_OUTER_PARAGRAPH_TAGS.render(PARSER.parse(rawDocs))
                : DEFAULT_RENDERER.render(PARSER.parse(rawDocs));
        renderedHtml = unescapeSafeHtmlTags(renderedHtml);
        return StringUtils.appendIfMissing(renderedHtml, "\n").replaceAll("<br />", "");
    }

    /**
     * After CommonMark renders with escapeHtml(true), all raw HTML from the source is escaped (e.g. &lt;a
     * href=&quot;...&quot;&gt;). This method selectively un-escapes tags whose tag name is in
     * {@link #SAFE_JAVADOC_TAGS}, since Javadoc natively supports standard HTML.
     */
    private static String unescapeSafeHtmlTags(String html) {
        Matcher matcher = ESCAPED_TAG.matcher(html);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String tagName = matcher.group(2).toLowerCase();
            if (SAFE_JAVADOC_TAGS.contains(tagName)) {
                String attrs = matcher.group(3).replace("&quot;", "\"").replace("&amp;", "&");
                String replacement = "<" + matcher.group(1) + attrs + matcher.group(4) + ">";
                matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
            } else {
                matcher.appendReplacement(result, Matcher.quoteReplacement(matcher.group(0)));
            }
        }
        matcher.appendTail(result);
        return result.toString();
    }

    public static String getParameterJavadoc(String paramName, String docs) {
        return "@param " + paramName + " " + docs + "\n";
    }

    public static CodeBlock getThrowsJavadoc(TypeName typeName, String docs) {
        return CodeBlock.of("@throws $T $L \n", typeName, docs);
    }

    public static String getReturnDocs(String returnDocs) {
        if (returnDocs.startsWith("returns") || returnDocs.startsWith("Returns")) {
            return "@return " + render(returnDocs.substring(7).strip());
        }
        return "@return " + render(returnDocs, true);
    }

    private JavaDocUtils() {}
}
