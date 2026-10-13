use std::ffi::OsStr;
use std::fmt::Write as _;

/// Axis a multi-colour banner gradient runs along.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum BannerDirection {
    /// Left to right across the widest line.
    #[default]
    Horizontal,
    /// Top to bottom across the lines.
    Vertical,
    /// Top-left to bottom-right. Rows count double because terminal cells are about twice as tall as they are wide.
    Diagonal,
}

pub struct Banner {
    text: String,
    stops: Vec<(u8, u8, u8)>,
    direction: BannerDirection,
    line_stops: Vec<(u8, u8, u8)>,
}

impl Banner {
    pub fn new(text: &str) -> Self {
        Self {
            text: text.to_string(),
            stops: Vec::new(),
            direction: BannerDirection::default(),
            line_stops: Vec::new(),
        }
    }

    pub fn colors(mut self, hex: &[&str]) -> Self {
        self.stops = hex
            .iter()
            .filter_map(|color| parse_hex_color(color))
            .collect();
        self
    }

    pub fn direction(mut self, direction: BannerDirection) -> Self {
        self.direction = direction;
        self
    }

    /// One solid colour per line, in order; lines past the end reuse the last colour.
    /// Takes precedence over `colors`.
    pub fn line_colors(mut self, hex: &[&str]) -> Self {
        self.line_stops = hex
            .iter()
            .filter_map(|color| parse_hex_color(color))
            .collect();
        self
    }

    fn color_for_cell(
        &self,
        line: usize,
        column: usize,
        lines: usize,
        widest: usize,
    ) -> (u8, u8, u8) {
        if let Some(last) = self.line_stops.last() {
            return self.line_stops.get(line).copied().unwrap_or(*last);
        }
        match self.direction {
            BannerDirection::Horizontal => color_at(&self.stops, column, widest),
            BannerDirection::Vertical => color_at(&self.stops, line, lines),
            BannerDirection::Diagonal => color_at(
                &self.stops,
                column + 2 * line,
                widest + 2 * lines.saturating_sub(1),
            ),
        }
    }

    pub(crate) fn render(&self, color: bool) -> String {
        if color && self.text.contains('\x1b') {
            return self.text.clone();
        }

        let text = self.text.trim_end_matches('\n');
        if !color || (self.stops.is_empty() && self.line_stops.is_empty()) || text.is_empty() {
            return text.to_string();
        }

        let lines: Vec<&str> = text.split('\n').collect();
        let widest = lines
            .iter()
            .map(|line| line.chars().count())
            .max()
            .unwrap_or(0);
        let mut rendered = String::new();

        for (line_index, line) in lines.iter().enumerate() {
            let mut active_color = None;
            for (column, character) in line.chars().enumerate() {
                if character == ' ' {
                    if active_color.take().is_some() {
                        rendered.push_str("\x1b[0m");
                    }
                    rendered.push(character);
                    continue;
                }

                let next_color = self.color_for_cell(line_index, column, lines.len(), widest);
                if active_color != Some(next_color) {
                    let (red, green, blue) = next_color;
                    let _ = write!(rendered, "\x1b[38;2;{red};{green};{blue}m");
                    active_color = Some(next_color);
                }
                rendered.push(character);
            }
            rendered.push_str("\x1b[0m");
            if line_index + 1 < lines.len() {
                rendered.push('\n');
            }
        }

        rendered
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum BannerMode {
    Off,
    Plain,
    Color,
}

pub(crate) fn banner_mode(
    stdout_is_tty: bool,
    no_color: Option<&OsStr>,
    term: Option<&OsStr>,
) -> BannerMode {
    if !stdout_is_tty {
        return BannerMode::Off;
    }
    if no_color.is_some_and(|value| !value.is_empty()) || term == Some(OsStr::new("dumb")) {
        return BannerMode::Plain;
    }
    BannerMode::Color
}

fn parse_hex_color(hex: &str) -> Option<(u8, u8, u8)> {
    let bytes = hex.as_bytes();
    if bytes.len() != 7 || bytes[0] != b'#' {
        return None;
    }

    let channel = |high, low| Some((hex_digit(high)? << 4) | hex_digit(low)?);
    Some((
        channel(bytes[1], bytes[2])?,
        channel(bytes[3], bytes[4])?,
        channel(bytes[5], bytes[6])?,
    ))
}

fn hex_digit(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}

fn color_at(stops: &[(u8, u8, u8)], column: usize, width: usize) -> (u8, u8, u8) {
    if stops.is_empty() {
        return (255, 255, 255);
    }

    if stops.len() == 1 || width <= 1 {
        return stops[0];
    }

    let denominator = width - 1;
    let numerator = column.min(denominator) * (stops.len() - 1);
    let start_index = numerator / denominator;
    let remainder = numerator % denominator;
    let start = stops[start_index];
    let end = stops[(start_index + 1).min(stops.len() - 1)];

    let interpolate = |start: u8, end: u8| {
        let start = usize::from(start);
        let end = usize::from(end);
        ((start * (denominator - remainder) + end * remainder + denominator / 2) / denominator)
            as u8
    };

    (
        interpolate(start.0, end.0),
        interpolate(start.1, end.1),
        interpolate(start.2, end.2),
    )
}

#[cfg(test)]
mod tests {
    use super::{banner_mode, color_at, Banner, BannerDirection, BannerMode};
    use std::ffi::OsStr;

    #[test]
    fn color_at_returns_white_for_empty_stops() {
        assert_eq!(color_at(&[], 0, 1), (255, 255, 255));
    }

    #[test]
    fn render_plain_text_and_trim_trailing_newlines() {
        assert_eq!(Banner::new("  fern\ncli\n\n").render(false), "  fern\ncli");
    }

    #[test]
    fn render_single_color() {
        assert_eq!(
            Banner::new("AB").colors(&["#12aBcD"]).render(true),
            "\x1b[38;2;18;171;205mAB\x1b[0m"
        );
    }

    #[test]
    fn render_gradient_endpoints_across_widest_line() {
        let rendered = Banner::new("A B\nxyz")
            .colors(&["#ff0000", "#0000ff"])
            .render(true);

        assert!(rendered.starts_with("\x1b[38;2;255;0;0mA"));
        assert!(rendered.contains("\x1b[38;2;0;0;255mB\x1b[0m"));
    }

    #[test]
    fn render_vertical_gradient_runs_down_the_lines() {
        assert_eq!(
            Banner::new("AB\nCD")
                .colors(&["#ff0000", "#0000ff"])
                .direction(BannerDirection::Vertical)
                .render(true),
            "\x1b[38;2;255;0;0mAB\x1b[0m\n\x1b[38;2;0;0;255mCD\x1b[0m"
        );
    }

    #[test]
    fn render_diagonal_gradient_spans_corner_to_corner() {
        let rendered = Banner::new("AB\nCD")
            .colors(&["#ff0000", "#0000ff"])
            .direction(BannerDirection::Diagonal)
            .render(true);

        assert!(rendered.starts_with("\x1b[38;2;255;0;0mA"));
        assert!(rendered.ends_with("\x1b[38;2;0;0;255mD\x1b[0m"));
    }

    #[test]
    fn render_line_colors_reuse_the_last_colour() {
        assert_eq!(
            Banner::new("A\nB\nC")
                .colors(&["#ffffff"])
                .line_colors(&["#ff0000", "#00ff00"])
                .render(true),
            "\x1b[38;2;255;0;0mA\x1b[0m\n\x1b[38;2;0;255;0mB\x1b[0m\n\x1b[38;2;0;255;0mC\x1b[0m"
        );
    }

    #[test]
    fn render_leaves_spaces_uncolored() {
        assert_eq!(
            Banner::new("A B").colors(&["#ffffff"]).render(true),
            "\x1b[38;2;255;255;255mA\x1b[0m \x1b[38;2;255;255;255mB\x1b[0m"
        );
    }

    #[test]
    fn render_preserves_pre_escaped_text_verbatim() {
        let text = "\x1b[31mred\x1b[0m\n";
        assert_eq!(Banner::new(text).colors(&["#ffffff"]).render(true), text);
    }

    #[test]
    fn render_skips_invalid_runtime_colors() {
        assert_eq!(
            Banner::new("A").colors(&["blue", "#010203"]).render(true),
            "\x1b[38;2;1;2;3mA\x1b[0m"
        );
    }

    #[test]
    fn chooses_banner_mode_from_tty_and_environment() {
        let cases = [
            (false, None, None, BannerMode::Off),
            (false, Some("1"), Some("dumb"), BannerMode::Off),
            (true, None, None, BannerMode::Color),
            (true, Some(""), None, BannerMode::Color),
            (true, Some("1"), None, BannerMode::Plain),
            (true, None, Some("dumb"), BannerMode::Plain),
            (true, None, Some("xterm-256color"), BannerMode::Color),
            (true, Some("1"), Some("xterm-256color"), BannerMode::Plain),
        ];

        for (stdout_is_tty, no_color, term, expected) in cases {
            let actual = banner_mode(
                stdout_is_tty,
                no_color.map(OsStr::new),
                term.map(OsStr::new),
            );
            assert_eq!(actual, expected);
        }
    }
}
