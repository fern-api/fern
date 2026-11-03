use std::ffi::OsStr;
use std::fmt::Write as _;
use std::io::Write;
use std::time::Duration;

const SHIMMER_FRAMES: usize = 18;
const SHIMMER_FRAME_DELAY: Duration = Duration::from_millis(35);
/// Half-width of the highlight band, in cells along the diagonal.
const SHIMMER_BAND: f32 = 8.0;
/// How far the band centre lifts a colour towards white.
const SHIMMER_STRENGTH: f32 = 0.7;

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
    animate: bool,
}

impl Banner {
    pub fn new(text: &str) -> Self {
        Self {
            text: text.to_string(),
            stops: Vec::new(),
            direction: BannerDirection::default(),
            line_stops: Vec::new(),
            animate: false,
        }
    }

    /// Plays a short highlight sweep across the coloured banner before root help.
    /// Only runs on an interactive terminal tall and wide enough for the whole banner.
    pub fn animate(mut self, animate: bool) -> Self {
        self.animate = animate;
        self
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
        self.render_with(color, false)
    }

    /// `per_cell` repeats the colour escape before every glyph (instead of once per run)
    /// so the shimmer can lighten each cell on its own.
    fn render_with(&self, color: bool, per_cell: bool) -> String {
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
                if per_cell || active_color != Some(next_color) {
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

impl Banner {
    /// Plays the shimmer in place when `help` (the rendered root help) starts with this
    /// banner, leaving the cursor where the banner begins so `help` overwrites the last
    /// frame with the identical static banner. No-op unless `animate` is set and
    /// stdout is a terminal that fits the banner.
    pub(crate) fn play_intro(&self, help: &str, out: &mut dyn Write) {
        if !self.animate {
            return;
        }
        let rendered = self.render(true);
        if !help.starts_with(&rendered) {
            return;
        }
        let (lines, widest) = visible_size(&rendered);
        match stdout_terminal_size() {
            Some((columns, rows)) if widest <= columns && lines < rows => {}
            _ => return,
        }

        let cells = self.render_with(true, true);
        let span = widest + 2 * lines.saturating_sub(1);
        let rewind = if lines > 1 {
            format!("\r\x1b[{}A", lines - 1)
        } else {
            "\r".to_string()
        };
        let _ = out.write_all(b"\x1b[?25l");
        for frame in 0..SHIMMER_FRAMES {
            let _ = out.write_all(shimmer_frame(&cells, shimmer_center(frame, span)).as_bytes());
            let _ = out.write_all(rewind.as_bytes());
            let _ = out.flush();
            std::thread::sleep(SHIMMER_FRAME_DELAY);
        }
        let _ = out.write_all(b"\x1b[?25h");
        let _ = out.flush();
    }
}

/// Band centre for `frame`: enters off the top-left and leaves past the bottom-right.
fn shimmer_center(frame: usize, span: usize) -> f32 {
    let travel = span as f32 + 2.0 * SHIMMER_BAND;
    -SHIMMER_BAND + travel * frame as f32 / (SHIMMER_FRAMES - 1) as f32
}

/// Lightens every truecolour escape in `rendered` by its cell's distance from a
/// diagonal band centred on `center`. Text without truecolour escapes is unchanged.
pub(crate) fn shimmer_frame(rendered: &str, center: f32) -> String {
    let mut frame = String::with_capacity(rendered.len());
    let (mut line, mut column) = (0usize, 0usize);
    let mut chars = rendered.chars().peekable();
    while let Some(character) = chars.next() {
        match character {
            '\x1b' if chars.peek() == Some(&'[') => {
                chars.next();
                let mut params = String::new();
                let mut terminator = None;
                for next in chars.by_ref() {
                    if next.is_ascii_alphabetic() {
                        terminator = Some(next);
                        break;
                    }
                    params.push(next);
                }
                let distance = ((column + 2 * line) as f32 - center).abs();
                let lift = (1.0 - distance / SHIMMER_BAND).max(0.0) * SHIMMER_STRENGTH;
                frame.push_str("\x1b[");
                if terminator == Some('m') && lift > 0.0 {
                    frame.push_str(&lighten_sgr(&params, lift));
                } else {
                    frame.push_str(&params);
                }
                if let Some(terminator) = terminator {
                    frame.push(terminator);
                }
            }
            '\n' => {
                line += 1;
                column = 0;
                frame.push(character);
            }
            _ => {
                column += 1;
                frame.push(character);
            }
        }
    }
    frame
}

fn lighten_sgr(params: &str, lift: f32) -> String {
    let parts: Vec<&str> = params.split(';').collect();
    let mut out: Vec<String> = Vec::with_capacity(parts.len());
    let mut index = 0;
    while index < parts.len() {
        if (parts[index] == "38" || parts[index] == "48")
            && parts.get(index + 1) == Some(&"2")
            && index + 4 < parts.len()
        {
            out.push(parts[index].to_string());
            out.push("2".to_string());
            for channel in &parts[index + 2..index + 5] {
                let value = channel.parse::<u8>().unwrap_or(0) as f32;
                out.push(((value + (255.0 - value) * lift).round() as u8).to_string());
            }
            index += 5;
        } else {
            out.push(parts[index].to_string());
            index += 1;
        }
    }
    out.join(";")
}

/// (lines, widest line) of `rendered`, counting visible characters only.
fn visible_size(rendered: &str) -> (usize, usize) {
    let mut lines = 1;
    let (mut column, mut widest) = (0, 0);
    let mut in_escape = false;
    for character in rendered.chars() {
        if in_escape {
            in_escape = !character.is_ascii_alphabetic();
            continue;
        }
        match character {
            '\x1b' => in_escape = true,
            '\n' => {
                lines += 1;
                column = 0;
            }
            _ => {
                column += 1;
                widest = widest.max(column);
            }
        }
    }
    (lines, widest)
}

#[cfg(unix)]
fn stdout_terminal_size() -> Option<(usize, usize)> {
    use std::io::IsTerminal;
    if !std::io::stdout().is_terminal() {
        return None;
    }
    // SAFETY: TIOCGWINSZ only writes a `winsize` into the pointer we pass.
    let mut size: libc::winsize = unsafe { std::mem::zeroed() };
    let ok = unsafe { libc::ioctl(libc::STDOUT_FILENO, libc::TIOCGWINSZ, &mut size) } == 0;
    (ok && size.ws_col > 0 && size.ws_row > 0)
        .then(|| (usize::from(size.ws_col), usize::from(size.ws_row)))
}

#[cfg(not(unix))]
fn stdout_terminal_size() -> Option<(usize, usize)> {
    None
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
    use super::{
        banner_mode, color_at, shimmer_frame, visible_size, Banner, BannerDirection, BannerMode,
    };
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

    #[test]
    fn shimmer_lightens_cells_near_the_band_only() {
        let rendered = Banner::new(&"A".repeat(30))
            .colors(&["#000000"])
            .render_with(true, true);
        let frame = shimmer_frame(&rendered, 0.0);

        assert!(frame.starts_with("\x1b[38;2;179;179;179mA"));
        assert!(frame.ends_with("\x1b[38;2;0;0;0mA\x1b[0m"));
        assert_eq!(visible_size(&frame), visible_size(&rendered));
    }

    #[test]
    fn shimmer_lightens_background_colours_in_pre_coloured_art() {
        let frame = shimmer_frame("\x1b[38;2;0;0;0m\x1b[48;2;100;100;100m▀\x1b[0m", 0.0);
        assert_eq!(
            frame,
            "\x1b[38;2;179;179;179m\x1b[48;2;209;209;209m▀\x1b[0m"
        );
    }

    #[test]
    fn shimmer_leaves_plain_text_alone() {
        assert_eq!(shimmer_frame("AB\nCD", 0.0), "AB\nCD");
    }

    #[test]
    fn per_cell_render_looks_the_same_as_the_static_banner() {
        let banner = Banner::new("AB C").colors(&["#ff0000"]);
        assert_eq!(
            banner.render_with(true, true),
            "\x1b[38;2;255;0;0mA\x1b[38;2;255;0;0mB\x1b[0m \x1b[38;2;255;0;0mC\x1b[0m"
        );
        assert_eq!(
            visible_size(&banner.render_with(true, true)),
            visible_size(&banner.render(true))
        );
    }

    #[test]
    fn visible_size_ignores_escapes() {
        assert_eq!(visible_size("\x1b[31mABC\x1b[0m\nD"), (2, 3));
    }

    #[test]
    fn play_intro_skips_when_not_animated_or_not_a_terminal() {
        let banner = Banner::new("LOGO").colors(&["#ff0000"]);
        let help = format!("{}\nUsage: test", banner.render(true));
        let mut out = Vec::new();
        banner.play_intro(&help, &mut out);
        // Under `cargo test` stdout is not a terminal, so even an animated banner stays static.
        banner.animate(true).play_intro(&help, &mut out);
        assert!(out.is_empty());
    }
}
