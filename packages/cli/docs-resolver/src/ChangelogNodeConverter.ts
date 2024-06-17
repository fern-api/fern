import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { last } from "lodash-es";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { extractDatetimeFromChangelogTitle } from "./utils/extractDatetimeFromChangelogTitle";

dayjs.extend(utc);

export class ChangelogNodeConverter {
    public constructor(
        private workspace: FernWorkspace,
        private docsWorkspace: DocsWorkspace,
        private idgen: NodeIdGenerator
    ) {}

    public convert(parentSlug: FernNavigation.SlugGenerator): FernNavigation.ChangelogNode | undefined {
        if (this.workspace.changelog == null || this.workspace.changelog.files.length === 0) {
            return undefined;
        }

        this.idgen = this.idgen.append("changelog");
        const unsortedChangelogItems: { date: Date; pageId: RelativeFilePath }[] = [];
        for (const file of this.workspace.changelog.files) {
            const filename = last(file.absoluteFilepath.split("/"));
            if (filename == null) {
                continue;
            }
            const changelogDate = extractDatetimeFromChangelogTitle(filename);
            if (changelogDate == null) {
                continue;
            }
            const relativePath = this.toRelativeFilepath(file.absoluteFilepath);
            unsortedChangelogItems.push({ date: changelogDate, pageId: relativePath });
        }
        // sort changelog items by date, in descending order
        const changelogItems = unsortedChangelogItems.map((item): FernNavigation.ChangelogEntryNode => {
            const date = dayjs.utc(item.date);
            return {
                id: this.idgen.append(date.format("YYYY-M-D")).get(),
                type: "changelogEntry",
                title: date.format("MMMM D, YYYY"),
                slug: parentSlug.append(date.format("YYYY/M/D")).get(),
                icon: undefined,
                hidden: undefined,
                date: item.date.toISOString(),
                pageId: FernNavigation.PageId(item.pageId)
            };
        });

        const entries = orderBy(changelogItems, (entry) => entry.date, "desc");
        const changelogYears = this.groupByYear(entries, parentSlug);

        return {
            id: this.idgen.get(),
            type: "changelog",
            title: "Changelog",
            slug: parentSlug.append("changelog").get(),
            icon: undefined,
            hidden: undefined,
            children: changelogYears,
            overviewPageId: undefined
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
