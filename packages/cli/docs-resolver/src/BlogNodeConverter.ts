import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { kebabCase, last } from "lodash-es";

import { NodeIdGenerator } from "./NodeIdGenerator.js";
import { extractDatetimeFromChangelogTitle } from "./utils/extractDatetimeFromChangelogTitle.js";

dayjs.extend(utc);

const DEFAULT_BLOG_TITLE = "Blog";

// if the filename of the blog file is one of these, it will be treated as an overview page
const RESERVED_OVERVIEW_PAGE_NAMES = ["summary", "index", "overview"];

interface ConvertOptions {
    parentSlug: FernNavigation.V1.SlugGenerator;
    title?: string;
    icon?: string;
    hidden?: boolean;
    slug?: string;
    viewers?: string[];
    orphaned?: boolean;
}

/**
 * Builds a {@link FernNavigation.V1.BlogNode} from a directory of dated markdown
 * posts. Mirrors {@link ChangelogNodeConverter} (same year → month → entry tree,
 * so the FDR-side loader/decompose/traversal utilities are shared), with one
 * deliberate difference: entry slugs are title/filename-based (frontmatter `slug`
 * wins, else the filename minus a leading `YYYY-MM-DD-` date), not date-based.
 * The docs bundle flattens the tree back into a card grid. See ADR 0023.
 */
export class BlogNodeConverter {
    public constructor(
        private markdownToFullSlug: Map<AbsoluteFilePath, string>,
        private markdownToNoIndex: Map<AbsoluteFilePath, boolean>,
        private markdownToTags: Map<AbsoluteFilePath, string[]>,
        private blogFiles: AbsoluteFilePath[] | undefined,
        private docsWorkspace: DocsWorkspace,
        private idgen: NodeIdGenerator
    ) {}

    public toBlogNode(opts: ConvertOptions): FernNavigation.V1.BlogNode {
        const title = opts.title ?? DEFAULT_BLOG_TITLE;

        const unsortedBlogItems: {
            date: Date;
            pageId: FernNavigation.PageId;
            absoluteFilepath: AbsoluteFilePath;
        }[] = [];

        let overviewPagePath: AbsoluteFilePath | undefined = undefined;
        for (const absoluteFilepath of this.blogFiles ?? []) {
            const filename = last(absoluteFilepath.split("/"));
            if (filename == null) {
                continue;
            }
            const blogDate = extractDatetimeFromChangelogTitle(filename);
            if (blogDate == null) {
                const nameWithoutExtension = filename.split(".")[0]?.toLowerCase();
                if (nameWithoutExtension != null && RESERVED_OVERVIEW_PAGE_NAMES.includes(nameWithoutExtension)) {
                    overviewPagePath = absoluteFilepath;
                }

                continue;
            }
            const relativePath = this.toRelativeFilepath(absoluteFilepath);
            unsortedBlogItems.push({
                date: blogDate,
                pageId: FernNavigation.PageId(relativePath),
                absoluteFilepath
            });
        }

        const slug = opts.parentSlug.apply({
            fullSlug: overviewPagePath != null ? this.markdownToFullSlug.get(overviewPagePath)?.split("/") : undefined,
            skipUrlSlug: false, // blog pages should always have a url slug
            urlSlug: opts.slug ?? kebabCase(title)
        });

        const noindex = overviewPagePath != null ? this.markdownToNoIndex.get(overviewPagePath) : undefined;

        const blogItems = unsortedBlogItems.map((item): FernNavigation.V1.BlogEntryNode => {
            const date = dayjs.utc(item.date);
            return {
                id: this.idgen.get(item.pageId),
                type: "blogEntry",
                collapsed: undefined,
                title: date.format("MMMM D, YYYY"),
                slug: slug
                    .apply({
                        fullSlug: this.markdownToFullSlug.get(item.absoluteFilepath)?.split("/"),
                        // Title-based fallback: the post's filename minus a leading
                        // `YYYY-MM-DD-` prefix (frontmatter `slug` overrides via fullSlug).
                        urlSlug: this.fallbackUrlSlug(item.absoluteFilepath)
                    })
                    .get(),
                icon: undefined,
                hidden: undefined,
                date: item.date.toISOString(),
                pageId: item.pageId,
                noindex: this.markdownToNoIndex.get(item.absoluteFilepath),
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined,
                tags: this.markdownToTags.get(item.absoluteFilepath)
            };
        });

        const entries = orderBy(blogItems, (entry) => entry.date, "desc");
        const overviewPageId =
            overviewPagePath != null ? FernNavigation.PageId(this.toRelativeFilepath(overviewPagePath)) : undefined;
        const id = this.idgen.get(overviewPageId ?? "blog");
        const blogYears = this.groupByYear(id, entries, slug);

        return {
            id,
            type: "blog",
            collapsed: undefined,
            title,
            slug: slug.get(),
            icon: opts.icon,
            hidden: opts.hidden,
            children: blogYears,
            overviewPageId,
            noindex,
            authed: undefined,
            viewers: opts.viewers,
            orphaned: opts.orphaned,
            featureFlags: undefined
        };
    }

    public orUndefined(): BlogNodeConverter | undefined {
        return this.blogFiles != null && this.blogFiles.length > 0 ? this : undefined;
    }

    /** Derives a slug from a post filename, stripping a leading `YYYY-MM-DD-` date prefix. */
    private fallbackUrlSlug(absoluteFilepath: AbsoluteFilePath): string {
        const filename = last(absoluteFilepath.split("/")) ?? "";
        const nameWithoutExtension = filename.split(".")[0] ?? filename;
        const withoutDatePrefix = nameWithoutExtension.replace(/^\d{4}-\d{2}-\d{2}-?/, "");
        return kebabCase(withoutDatePrefix.length > 0 ? withoutDatePrefix : nameWithoutExtension);
    }

    private groupByYear(
        prefix: string,
        entries: FernNavigation.V1.BlogEntryNode[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.BlogYearNode[] {
        const years = new Map<number, FernNavigation.V1.BlogEntryNode[]>();
        for (const entry of entries) {
            const year = dayjs.utc(entry.date).year();
            const yearEntries = years.get(year) ?? [];
            yearEntries.push(entry);
            years.set(year, yearEntries);
        }
        return orderBy(
            Array.from(years.entries()).map(([year, entries]) => {
                const slug = parentSlug.append(year.toString()).get();
                const id = this.idgen.get(`${prefix}/year/${year}`);
                return {
                    id,
                    type: "blogYear" as const,
                    collapsed: undefined,
                    title: year.toString(),
                    year,
                    slug,
                    icon: undefined,
                    hidden: undefined,
                    children: this.groupByMonth(id, entries, parentSlug),
                    authed: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                };
            }),
            "year",
            "desc"
        );
    }

    private groupByMonth(
        prefix: string,
        entries: FernNavigation.V1.BlogEntryNode[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.BlogMonthNode[] {
        const months = new Map<number, FernNavigation.V1.BlogEntryNode[]>();
        for (const entry of entries) {
            const month = dayjs.utc(entry.date).month() + 1;
            const monthEntries = months.get(month) ?? [];
            monthEntries.push(entry);
            months.set(month, monthEntries);
        }
        return orderBy(
            Array.from(months.entries()).map(([month, entries]) => {
                const date = dayjs(new Date(0, month - 1));
                return {
                    id: this.idgen.get(`${prefix}/month/${month}`),
                    type: "blogMonth" as const,
                    collapsed: undefined,
                    title: date.format("MMMM YYYY"),
                    month,
                    slug: parentSlug.append(month.toString()).get(),
                    icon: undefined,
                    hidden: undefined,
                    children: entries,
                    authed: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                };
            }),
            "month",
            "desc"
        );
    }

    private toRelativeFilepath(filepath: AbsoluteFilePath): RelativeFilePath;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined {
        if (filepath == null) {
            return undefined;
        }
        return relative(this.docsWorkspace.absoluteFilePath, filepath);
    }
}

function orderBy<K extends string, T extends Record<K, string | number>>(
    items: T[],
    key: K,
    order?: "asc" | "desc"
): T[];
function orderBy<T>(items: T[], key: (item: T) => string | number, order?: "asc" | "desc"): T[];
function orderBy<K extends string, T extends Record<K, string | number>>(
    items: T[],
    key: K | ((item: T) => string | number),
    order: "asc" | "desc" = "asc"
): T[] {
    return items.concat().sort((a, b) => {
        const aValue = typeof key === "function" ? key(a) : a[key];
        const bValue = typeof key === "function" ? key(b) : b[key];
        if (aValue < bValue) {
            return order === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
            return order === "asc" ? 1 : -1;
        }
        return 0;
    });
}
