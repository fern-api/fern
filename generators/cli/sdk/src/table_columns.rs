//! `x-fern-cli-table`: per-operation columns for human `table` output.
//!
//! An operation can declare which fields its table shows, with labels,
//! order, alignment, width, and light value formatting:
//!
//! ```yaml
//! x-fern-cli-table:
//!   columns:
//!     - { header: NAME, path: name }
//!     - { header: ROWS, path: stats.rows, align: right }
//!     - { header: CREATED, path: createdAt, format: date }
//!     - { header: DESCRIPTION, path: description, maxWidth: 40, default: false }
//! ```
//!
//! Only `table` output changes. `--query` and every other format see the
//! full response. Paths are relative to each row, after
//! `x-fern-sdk-return-value` extraction.

use serde::Deserialize;
use serde_json::Value;
use std::fmt::Write;

/// Widest a column grows when the spec sets no `maxWidth`. Matches the
/// generic table formatter.
const DEFAULT_MAX_WIDTH: usize = 60;

/// Column widths of a streamed `--page-all` table, set by the first page
/// with rows and reused for later pages so their columns line up under the
/// one header. Longer values on later pages are cut off with `…`.
#[derive(Debug, Clone, Default)]
pub struct PageWidths(std::sync::Arc<std::sync::Mutex<Option<Vec<usize>>>>);

impl PageWidths {
    pub(crate) fn with<R>(&self, f: impl FnOnce(&mut Option<Vec<usize>>) -> R) -> R {
        let mut slot = self.0.lock().unwrap_or_else(|e| e.into_inner());
        f(&mut slot)
    }
}

/// Parsed `x-fern-cli-table` extension.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TableSpec {
    pub columns: Vec<TableColumn>,
}

/// One column of a [`TableSpec`].
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TableColumn {
    /// Column label printed in the header row.
    pub header: String,
    /// Dot-separated field path inside each row.
    pub path: String,
    #[serde(default)]
    pub align: Align,
    /// Longer values are cut to this many characters, ending in `…`.
    #[serde(default)]
    pub max_width: Option<usize>,
    #[serde(default)]
    pub format: Option<CellFormat>,
    /// `false` hides the column unless the user adds it with `--columns`.
    #[serde(default = "default_true")]
    pub default: bool,
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Align {
    #[default]
    Left,
    Right,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CellFormat {
    /// Shorten an ISO-8601 timestamp to its `YYYY-MM-DD` date.
    Date,
}

impl TableSpec {
    /// Parse the raw extension value. Returns a description of the problem
    /// when the value is malformed so the caller can warn and ignore it.
    pub fn from_yaml(raw: &serde_yaml::Value) -> Result<Self, String> {
        let spec: TableSpec = serde_yaml::from_value(raw.clone()).map_err(|e| e.to_string())?;
        if spec.columns.is_empty() {
            return Err("`columns` must list at least one column".to_string());
        }
        for column in &spec.columns {
            if column.header.trim().is_empty() {
                return Err("every column needs a non-empty `header`".to_string());
            }
            if column.path.trim().is_empty() {
                return Err(format!(
                    "column `{}` needs a non-empty `path`",
                    column.header
                ));
            }
            if column.max_width == Some(0) {
                return Err(format!(
                    "column `{}`: `maxWidth` must be at least 1",
                    column.header
                ));
            }
        }
        if !spec.columns.iter().any(|c| c.default) {
            return Err("at least one column must be shown by default".to_string());
        }
        Ok(spec)
    }

    /// Columns shown when `--columns` is not passed.
    pub fn default_columns(&self) -> Vec<TableColumn> {
        self.columns.iter().filter(|c| c.default).cloned().collect()
    }

    /// Resolve the columns to render for a `--columns` value.
    ///
    /// - `None`: the default columns.
    /// - `all`: `Ok(None)`, meaning the generic table with every field.
    /// - `a,b,c`: exactly those columns, in that order.
    /// - `+a,-b`: the default columns with `a` added and `b` removed.
    ///
    /// Names match a column's `header` or `path` (case-insensitive). An
    /// unknown name in a list or after `+` is treated as a field path, so
    /// users can show fields the spec does not declare.
    pub fn select(&self, selection: Option<&str>) -> Result<Option<Vec<TableColumn>>, String> {
        let Some(selection) = selection else {
            return Ok(Some(self.default_columns()));
        };
        let tokens: Vec<&str> = selection
            .split(',')
            .map(str::trim)
            .filter(|t| !t.is_empty())
            .collect();
        if tokens.is_empty() {
            return Err("--columns needs at least one column name".to_string());
        }
        if tokens.iter().any(|t| t.eq_ignore_ascii_case("all")) {
            if tokens.len() > 1 {
                return Err("--columns all can't be combined with other columns".to_string());
            }
            return Ok(None);
        }
        let modifiers = tokens
            .iter()
            .filter(|t| t.starts_with('+') || t.starts_with('-'))
            .count();
        if modifiers != 0 && modifiers != tokens.len() {
            return Err(
                "--columns takes either a list of columns (name,stage) or changes to the \
                 default columns (+description,-sync), not both"
                    .to_string(),
            );
        }

        if modifiers == 0 {
            let mut columns: Vec<TableColumn> = Vec::new();
            for token in &tokens {
                let column = self.column_for(token);
                if !columns.contains(&column) {
                    columns.push(column);
                }
            }
            return Ok(Some(columns));
        }

        let mut columns = self.default_columns();
        for token in tokens {
            let name = token[1..].trim();
            if name.is_empty() {
                return Err(format!("--columns: `{token}` is missing a column name"));
            }
            if token.starts_with('+') {
                let column = self.column_for(name);
                if !columns.contains(&column) {
                    columns.push(column);
                }
            } else {
                let before = columns.len();
                columns.retain(|c| !matches_name(c, name));
                if columns.len() == before {
                    return Err(format!(
                        "--columns: `{name}` is not one of the shown columns ({})",
                        self.default_columns()
                            .iter()
                            .map(|c| c.header.as_str())
                            .collect::<Vec<_>>()
                            .join(", ")
                    ));
                }
            }
        }
        // Keep declared order however the modifiers were written; ad hoc
        // field paths go last.
        columns.sort_by_key(|c| {
            self.columns
                .iter()
                .position(|d| d == c)
                .unwrap_or(usize::MAX)
        });
        if columns.is_empty() {
            return Err("--columns removed every column".to_string());
        }
        Ok(Some(columns))
    }

    fn column_for(&self, name: &str) -> TableColumn {
        self.columns
            .iter()
            .find(|c| matches_name(c, name))
            .cloned()
            .unwrap_or_else(|| TableColumn {
                header: name.to_string(),
                path: name.to_string(),
                align: Align::Left,
                max_width: None,
                format: None,
                default: true,
            })
    }

    /// `--columns` help text listing the declared columns.
    pub fn columns_help(&self) -> String {
        let names = |shown: bool| {
            self.columns
                .iter()
                .filter(|c| c.default == shown)
                .map(|c| c.header.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        };
        let mut help = format!(
            "Columns for table output, comma-separated. Use +COL / -COL to change the \
             default set, a field path for an undeclared field, or `all` for every field. \
             Default: {}",
            names(true)
        );
        let hidden = names(false);
        if !hidden.is_empty() {
            let _ = write!(help, ". Also available: {hidden}");
        }
        help
    }
}

fn matches_name(column: &TableColumn, name: &str) -> bool {
    column.header.eq_ignore_ascii_case(name) || column.path.eq_ignore_ascii_case(name)
}

/// Look up a dot-separated `path` in `row`. A key that itself contains dots
/// is matched before the path is split.
fn lookup<'a>(row: &'a Value, path: &str) -> Option<&'a Value> {
    if let Some(v) = row.get(path) {
        return Some(v);
    }
    let mut current = row;
    for segment in path.split('.') {
        current = current.get(segment)?;
    }
    Some(current)
}

fn cell(row: &Value, column: &TableColumn) -> String {
    let Some(value) = lookup(row, &column.path) else {
        return String::new();
    };
    let text = crate::formatter::value_to_cell(value);
    match column.format {
        Some(CellFormat::Date) => shorten_to_date(&text).unwrap_or(text),
        None => text,
    }
}

fn shorten_to_date(text: &str) -> Option<String> {
    let date = text.get(..10)?;
    let bytes = date.as_bytes();
    let is_date = bytes.iter().enumerate().all(|(i, b)| match i {
        4 | 7 => *b == b'-',
        _ => b.is_ascii_digit(),
    });
    is_date.then(|| date.to_string())
}

fn truncate(text: &str, width: usize) -> String {
    if text.chars().count() <= width {
        return text.to_string();
    }
    let kept: String = text.chars().take(width.saturating_sub(1)).collect();
    format!("{kept}…")
}

fn pad(text: &str, width: usize, align: Align) -> String {
    let fill = " ".repeat(width.saturating_sub(text.chars().count()));
    match align {
        Align::Left => format!("{text}{fill}"),
        Align::Right => format!("{fill}{text}"),
    }
}

/// Render one response (or one page of a paginated response) using
/// `columns`. Returns `None` when the value has no rows or record these
/// columns describe, so the caller falls back to the generic table.
///
/// `page_widths` is set for streamed pages: the first page with rows prints
/// the header and fixes the widths that later pages reuse.
pub(crate) fn render(
    value: &Value,
    columns: &[TableColumn],
    emit_header: bool,
    page_widths: Option<&mut Option<Vec<usize>>>,
) -> Option<String> {
    match value {
        Value::Array(items) => {
            let rows = page_rows(items, columns).unwrap_or_else(|| items.iter().collect());
            Some(render_rows(&rows, columns, emit_header, page_widths))
        }
        Value::Object(obj) => {
            // A record with its own array fields (e.g. `tags`) is still a
            // record, not a list envelope.
            if columns.iter().any(|c| lookup(value, &c.path).is_some()) {
                return Some(render_record(value, columns));
            }
            if let Some((_, rows)) = crate::formatter::extract_items(value) {
                let rows: Vec<&Value> = rows.iter().collect();
                return Some(render_rows(&rows, columns, emit_header, page_widths));
            }
            // A list envelope whose page came back empty.
            if obj
                .values()
                .any(|v| matches!(v, Value::Array(a) if a.is_empty()))
            {
                return Some(render_rows(&[], columns, emit_header, page_widths));
            }
            None
        }
        _ => None,
    }
}

/// Rows of a captured `--page-all` result, which is one item per page: each
/// page is either a row array (after `x-fern-sdk-return-value`) or a list
/// envelope. `None` when `items` are already rows.
fn page_rows<'a>(items: &'a [Value], columns: &[TableColumn]) -> Option<Vec<&'a Value>> {
    if items.is_empty() {
        return None;
    }
    let mut rows = Vec::new();
    let mut parsed_pages = 0;
    for item in items {
        match item {
            Value::Array(page) => {
                parsed_pages += 1;
                rows.extend(page);
            }
            Value::Object(_) if !columns.iter().any(|c| lookup(item, &c.path).is_some()) => {
                // A page without a row list (e.g. `{"next": null}`) adds no rows.
                if let Some((_, page)) = crate::formatter::extract_items(item) {
                    parsed_pages += 1;
                    rows.extend(page);
                }
            }
            _ => return None,
        }
    }
    (parsed_pages > 0).then_some(rows)
}

fn render_rows(
    rows: &[&Value],
    columns: &[TableColumn],
    emit_header: bool,
    page_widths: Option<&mut Option<Vec<usize>>>,
) -> String {
    if rows.is_empty() {
        // An empty page partway through a streamed table adds nothing.
        if matches!(page_widths, Some(Some(_))) {
            return String::new();
        }
        return "(empty)\n".to_string();
    }
    let cells: Vec<Vec<String>> = rows
        .iter()
        .map(|row| columns.iter().map(|c| cell(row, c)).collect())
        .collect();
    // Later streamed pages keep the first page's widths. A longer value
    // pushes the rest of its row right rather than being cut off.
    let (widths, emit_header, carried) = match page_widths {
        Some(Some(widths)) => (widths.clone(), false, true),
        Some(slot) => {
            let widths = measure(&cells, columns);
            *slot = Some(widths.clone());
            (widths, true, false)
        }
        None => (measure(&cells, columns), emit_header, false),
    };

    let mut output = String::new();
    let mut push_line = |parts: Vec<String>| {
        let _ = writeln!(output, "{}", parts.join("  ").trim_end());
    };
    if emit_header {
        push_line(
            columns
                .iter()
                .zip(&widths)
                .map(|(c, w)| pad(&c.header, *w, c.align))
                .collect(),
        );
        push_line(widths.iter().map(|w| "─".repeat(*w)).collect());
    }
    for row in &cells {
        push_line(
            row.iter()
                .zip(columns.iter().zip(&widths))
                .map(|(text, (c, w))| {
                    let limit = if carried {
                        c.max_width.unwrap_or(DEFAULT_MAX_WIDTH)
                    } else {
                        *w
                    };
                    pad(&truncate(text, limit), *w, c.align)
                })
                .collect(),
        );
    }
    output
}

fn measure(cells: &[Vec<String>], columns: &[TableColumn]) -> Vec<usize> {
    columns
        .iter()
        .enumerate()
        .map(|(i, c)| {
            let widest = cells
                .iter()
                .map(|r| r[i].chars().count())
                .max()
                .unwrap_or(0);
            let cap = c.max_width.unwrap_or(DEFAULT_MAX_WIDTH);
            widest.min(cap).max(c.header.chars().count())
        })
        .collect()
}

fn render_record(record: &Value, columns: &[TableColumn]) -> String {
    let label_width = columns
        .iter()
        .map(|c| c.header.chars().count())
        .max()
        .unwrap_or(0);
    let mut output = String::new();
    for column in columns {
        let text = cell(record, column);
        let text = truncate(&text, column.max_width.unwrap_or(DEFAULT_MAX_WIDTH));
        let line = format!("{}  {text}", pad(&column.header, label_width, Align::Left));
        let _ = writeln!(output, "{}", line.trim_end());
    }
    output
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn spec(yaml: &str) -> TableSpec {
        TableSpec::from_yaml(&serde_yaml::from_str(yaml).unwrap()).unwrap()
    }

    fn datasets_spec() -> TableSpec {
        spec(
            r#"
columns:
  - { header: NAME, path: name }
  - { header: V, path: version, align: right }
  - { header: STAGE, path: stage }
  - { header: ROWS, path: stats.rows, align: right }
  - { header: CREATED, path: createdAt, format: date }
  - { header: DESCRIPTION, path: description, maxWidth: 12, default: false }
"#,
        )
    }

    fn rows() -> Value {
        json!([
            {
                "name": "aa_lcr", "version": 10, "stage": "approved",
                "stats": { "rows": 3870 }, "createdAt": "2026-06-30T12:00:00Z",
                "description": "Long context retrieval set", "datasetId": "79d0"
            },
            {
                "name": "aa_lcr_128k", "version": 1, "stage": "draft",
                "stats": { "rows": 3872 }, "createdAt": "2026-06-17T08:30:00Z",
                "description": "Short", "datasetId": "80e1"
            }
        ])
    }

    fn select(spec: &TableSpec, s: Option<&str>) -> Vec<String> {
        spec.select(s)
            .unwrap()
            .unwrap()
            .into_iter()
            .map(|c| c.header)
            .collect()
    }

    #[test]
    fn renders_declared_columns_in_order_with_alignment_and_dates() {
        let spec = datasets_spec();
        let out = render(&rows(), &spec.default_columns(), true, None).unwrap();
        assert_eq!(
            out,
            "NAME          V  STAGE     ROWS  CREATED\n\
             ───────────  ──  ────────  ────  ──────────\n\
             aa_lcr       10  approved  3870  2026-06-30\n\
             aa_lcr_128k   1  draft     3872  2026-06-17\n"
        );
    }

    #[test]
    fn continuation_pages_skip_the_header() {
        let spec = datasets_spec();
        let out = render(&rows(), &spec.default_columns(), false, None).unwrap();
        assert!(out.starts_with("aa_lcr "), "{out}");
        assert!(!out.contains("NAME"), "{out}");
    }

    #[test]
    fn streamed_pages_reuse_the_first_page_widths() {
        let spec = datasets_spec();
        let cols = spec.select(Some("name,v")).unwrap().unwrap();
        let mut widths = None;
        let first = render(&json!([]), &cols, true, Some(&mut widths)).unwrap();
        assert_eq!(first, "(empty)\n");
        let page1 = render(
            &json!([{ "name": "a", "version": 1 }]),
            &cols,
            false,
            Some(&mut widths),
        )
        .unwrap();
        assert_eq!(page1, "NAME  V\n────  ─\na     1\n");
        let page2 = render(
            &json!([{ "name": "very-long-name", "version": 10 }]),
            &cols,
            false,
            Some(&mut widths),
        )
        .unwrap();
        assert_eq!(page2, "very-long-name  10\n");
        let page3 = render(
            &json!([{ "name": "b", "version": 2 }]),
            &cols,
            false,
            Some(&mut widths),
        )
        .unwrap();
        assert_eq!(page3, "b     2\n");
        let empty = render(&json!([]), &cols, false, Some(&mut widths)).unwrap();
        assert_eq!(empty, "");
    }

    #[test]
    fn rows_are_found_inside_a_list_envelope() {
        let spec = datasets_spec();
        let envelope = json!({ "datasets": rows(), "nextCursor": "abc" });
        let out = render(&envelope, &spec.default_columns(), true, None).unwrap();
        assert!(out.contains("aa_lcr_128k"), "{out}");
    }

    #[test]
    fn captured_page_all_results_are_flattened() {
        let spec = datasets_spec();
        let cols = spec.default_columns();
        let pages = json!([rows(), [rows()[0].clone()]]);
        let out = render(&pages, &cols, true, None).unwrap();
        assert_eq!(
            out.lines().filter(|l| l.starts_with("aa_lcr ")).count(),
            2,
            "{out}"
        );
        let envelopes = json!([{ "datasets": rows(), "next": "p2" }, { "datasets": rows() }]);
        let out = render(&envelopes, &cols, true, None).unwrap();
        assert_eq!(
            out.lines().filter(|l| l.starts_with("aa_lcr_128k")).count(),
            2,
            "{out}"
        );
        let trailing_empty_page = json!([{ "datasets": rows(), "next": "p2" }, { "next": null }]);
        let out = render(&trailing_empty_page, &cols, true, None).unwrap();
        assert_eq!(out.lines().count(), 4, "{out}");
    }

    #[test]
    fn a_record_with_array_fields_renders_as_a_record() {
        let spec = datasets_spec();
        let cols = spec.default_columns();
        let record = json!({ "name": "aa_lcr", "tags": ["a", "b"] });
        let out = render(&record, &cols, true, None).unwrap();
        assert!(out.starts_with("NAME"), "{out}");
        assert!(out.lines().next().unwrap().ends_with("aa_lcr"), "{out}");
    }

    #[test]
    fn empty_pages_render_as_empty() {
        let spec = datasets_spec();
        let cols = spec.default_columns();
        assert_eq!(render(&json!([]), &cols, true, None).unwrap(), "(empty)\n");
        assert_eq!(
            render(&json!({ "datasets": [] }), &cols, true, None).unwrap(),
            "(empty)\n"
        );
    }

    #[test]
    fn single_records_render_as_label_value_pairs() {
        let spec = datasets_spec();
        let out = render(&rows()[0], &spec.default_columns(), true, None).unwrap();
        assert_eq!(
            out,
            "NAME     aa_lcr\nV        10\nSTAGE    approved\nROWS     3870\nCREATED  2026-06-30\n"
        );
    }

    #[test]
    fn unrelated_objects_fall_back_to_the_generic_table() {
        let spec = datasets_spec();
        assert!(render(
            &json!({ "saved_file": "x" }),
            &spec.default_columns(),
            true,
            None
        )
        .is_none());
    }

    #[test]
    fn max_width_truncates_long_values() {
        let spec = datasets_spec();
        let cols = spec.select(Some("name,description")).unwrap().unwrap();
        let out = render(&rows(), &cols, true, None).unwrap();
        assert!(out.contains("Long contex…"), "{out}");
        assert!(
            out.lines()
                .all(|l| l.chars().count() <= "aa_lcr_128k  DESCRIPTION".len() + 1),
            "{out}"
        );
    }

    #[test]
    fn non_date_values_are_left_alone_by_date_format() {
        assert_eq!(
            shorten_to_date("2026-09-08T10:00:00Z").as_deref(),
            Some("2026-09-08")
        );
        assert_eq!(shorten_to_date("yesterday"), None);
        assert_eq!(shorten_to_date("2026/09/08 10:00"), None);
    }

    #[test]
    fn select_defaults_lists_modifiers_and_all() {
        let spec = datasets_spec();
        assert_eq!(
            select(&spec, None),
            ["NAME", "V", "STAGE", "ROWS", "CREATED"]
        );
        assert_eq!(select(&spec, Some("stage, NAME")), ["STAGE", "NAME"]);
        assert_eq!(
            select(&spec, Some("+description,-v,-createdAt")),
            ["NAME", "STAGE", "ROWS", "DESCRIPTION"]
        );
        assert_eq!(select(&spec, Some("name,datasetId")), ["NAME", "datasetId"]);
        assert_eq!(select(&spec, Some("name,NAME,stage")), ["NAME", "STAGE"]);
        assert_eq!(
            select(&spec, Some("-v,+datasetId,+v")),
            ["NAME", "V", "STAGE", "ROWS", "CREATED", "datasetId"]
        );
        assert_eq!(spec.select(Some("all")).unwrap(), None);
    }

    #[test]
    fn select_rejects_bad_input() {
        let spec = datasets_spec();
        for bad in [
            "",
            " , ",
            "all,name",
            "name,+description",
            "-nope",
            "+",
            "-name,-v,-stage,-rows,-created",
        ] {
            assert!(
                spec.select(Some(bad)).is_err(),
                "{bad:?} should be rejected"
            );
        }
    }

    #[test]
    fn from_yaml_rejects_malformed_extensions() {
        for bad in [
            "columns: []",
            "columns: [{ header: A }]",
            "columns: [{ header: '', path: a }]",
            "columns: [{ header: A, path: a, maxWidth: 0 }]",
            "columns: [{ header: A, path: a, align: center }]",
            "columns: [{ header: A, path: a, format: money }]",
            "columns: [{ header: A, path: a, colour: red }]",
            "columns: [{ header: A, path: a, default: false }]",
            "colums: [{ header: A, path: a }]",
        ] {
            let raw: serde_yaml::Value = serde_yaml::from_str(bad).unwrap();
            assert!(
                TableSpec::from_yaml(&raw).is_err(),
                "{bad} should be rejected"
            );
        }
    }

    #[test]
    fn help_lists_default_and_hidden_columns() {
        let help = datasets_spec().columns_help();
        assert!(
            help.contains("Default: NAME, V, STAGE, ROWS, CREATED"),
            "{help}"
        );
        assert!(help.contains("Also available: DESCRIPTION"), "{help}");
    }
}
