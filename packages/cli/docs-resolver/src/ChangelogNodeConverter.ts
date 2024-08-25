import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { kebabCase, last } from "lodash-es";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { extractDatetimeFromChangelogTitle } from "./utils/extractDatetimeFromChangelogTitle";

dayjs.extend(utc);

const DEFAULT_CHANGELOG_TITLE = "Changelog";

interface ConvertOptions {
    parentSlug: FernNavigation.SlugGenerator;
    title?: string;
    icon?: string;
    hidden?: boolean;
    slug?: string;
    // skipUrlSlug?: boolean;
}

// if the filename of the changelog file is one of these, it will be treated as an overview page
const RESERVED_OVERVIEW_PAGE_NAMES = ["summary", "index", "overview"];

export class ChangelogNodeConverter {
    public constructor(
        private markdownToFullSlug: Map<AbsoluteFilePath, string>,
        private changelogFiles: AbsoluteFilePath[] | undefined,
        private docsWorkspace: DocsWorkspace,
        private idgen: NodeIdGenerator
    ) {}

    public convert(opts: ConvertOptions): FernNavigation.ChangelogNode | undefined {
        if (this.changelogFiles == null || this.changelogFiles.length === 0) {
            return undefined;
        }

        const title = opts.title ?? DEFAULT_CHANGELOG_TITLE;

        this.idgen = this.idgen.append("changelog");
        const unsortedChangelogItems: {
            date: Date;
            pageId: FernNavigation.PageId;
            absoluteFilepath: AbsoluteFilePath;
        }[] = [];
        let overviewPagePath: AbsoluteFilePath | undefined = undefined;
        for (const absoluteFilepath of this.changelogFiles) {
            const filename = last(absoluteFilepath.split("/"));
            if (filename == null) {
                continue;
            }
            const changelogDate = extractDatetimeFromChangelogTitle(filename);
            if (changelogDate == null) {
                const nameWihoutExtension = filename.split(".")[0]?.toLowerCase();
                if (nameWihoutExtension != null && RESERVED_OVERVIEW_PAGE_NAMES.includes(nameWihoutExtension)) {
                    overviewPagePath = absoluteFilepath;
                }

                continue;
            }
            const relativePath = this.toRelativeFilepath(absoluteFilepath);
            unsortedChangelogItems.push({
                date: changelogDate,
                pageId: FernNavigation.PageId(relativePath),
                absoluteFilepath
            });
        }

        const slug = opts.parentSlug.apply({
            fullSlug: overviewPagePath != null ? this.markdownToFullSlug.get(overviewPagePath)?.split("/") : undefined,
            skipUrlSlug: false, // changelog pages should always have a url slug
            urlSlug: opts.slug ?? kebabCase(title)
        });

        // sort changelog items by date, in descending order
        const changelogItems = unsortedChangelogItems.map((item): FernNavigation.ChangelogEntryNode => {
            const date = dayjs.utc(item.date);
            return {
                id: this.idgen.append(date.format("YYYY-M-D")).get(),
                type: "changelogEntry",
                title: date.format("MMMM D, YYYY"),
                slug: slug
                    .apply({
                        fullSlug: this.markdownToFullSlug.get(item.absoluteFilepath)?.split("/"),
                        urlSlug: date.format("YYYY/M/D")
                    })
                    .get(),
                icon: undefined,
                hidden: undefined,
                date: item.date.toISOString(),
                pageId: item.pageId,
                noindex: undefined
            };
        });

        const entries = orderBy(changelogItems, (entry) => entry.date, "desc");
        const changelogYears = this.groupByYear(entries, slug);

        return {
            id: this.idgen.get(),
            type: "changelog",
            title,
            slug: slug.get(),
            icon: opts.icon,
            hidden: opts.hidden,
            children: changelogYears,
            overviewPageId:
                overviewPagePath != null ? FernNavigation.PageId(this.toRelativeFilepath(overviewPagePath)) : undefined,
            noindex: undefined
        };
    }

    private groupByYear(
        entries: FernNavigation.ChangelogEntryNode[],
        parentSlug: FernNavigation.SlugGenerator
    ): FernNavigation.ChangelogYearNode[] {
        const years = new Map<number, FernNavigation.ChangelogEntryNode[]>();
        for (const entry of entries) {
            const year = dayjs.utc(entry.date).year();
            const yearEntries = years.get(year) ?? [];
            yearEntries.push(entry);
            years.set(year, yearEntries);
        }
        return orderBy(
            Array.from(years.entries()).map(([year, entries]) => {
                const slug = parentSlug.append(year.toString()).get();
                return {
                    id: this.idgen.append(year.toString()).get(),
                    type: "changelogYear" as const,
                    title: year.toString(),
                    year,
                    slug,
                    icon: undefined,
                    hidden: undefined,
                    children: this.groupByMonth(entries, parentSlug)
                };
            }),
            "year",
            "desc"
        );
    }

    private groupByMonth(
        entries: FernNavigation.ChangelogEntryNode[],
        parentSlug: FernNavigation.SlugGenerator
    ): FernNavigation.ChangelogMonthNode[] {
        const months = new Map<number, FernNavigation.ChangelogEntryNode[]>();
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
                    id: this.idgen.append(date.format("YYYY-M")).get(),
                    type: "changelogMonth" as const,
                    title: date.format("MMMM YYYY"),
                    month,
                    slug: parentSlug.append(month.toString()).get(),
                    icon: undefined,
                    hidden: undefined,
                    children: entries
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
        return relative(this.docsWorkspace.absoluteFilepath, filepath);
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
