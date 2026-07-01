import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

/**
 * Jack is the office labradoodle. He likes to nap under the desk and,
 * occasionally, bolt across the Fern CLI chasing a ball. 🎾
 *
 * The sprite is drawn side-on (facing right). Two leg frames alternate to fake
 * a running gait, and the whole composite slides left-to-right across the
 * terminal while a ball bounces just ahead of his nose.
 */

// Jack, side-on and facing right: a curled tail at the back (left), a long
// fluffy body, and a head with a floppy ear, an eye, and a snout/nose (`--<)
// pointing the way he's running.
const DOG_BODY: readonly string[] = [
    "     ___                 __",
    "    /   \\_______________/  \\",
    "   (                    o    |",
    "    \\                     `--<",
    "     \\___________________/"
];

// Only the legs change between frames; the body stays put so nothing jitters.
// "gathered" = legs tucked mid-stride, "spread" = legs extended in a gallop.
const LEGS_GATHERED = "      ||   ||      ||  ||";
const LEGS_SPREAD = "     //   //      \\\\  \\\\";

const DOG_LEGS_GATHERED: readonly string[] = [...DOG_BODY, LEGS_GATHERED];
const DOG_LEGS_SPREAD: readonly string[] = [...DOG_BODY, LEGS_SPREAD];

const FRAME_HEIGHT = DOG_LEGS_GATHERED.length;
const DOG_WIDTH = Math.max(...DOG_LEGS_GATHERED.map((line) => line.length));

// The row Jack's nose sits on; the ball bounces between this row and the one above.
const NOSE_ROW = 3;
// How far ahead of his nose the ball rolls.
const BALL_LEAD = 5;
const BALL = "o";

// Big strides + a short frame delay make him bolt across the screen.
const COLUMNS_PER_STEP = 5;
const SLEEP_BETWEEN_FRAMES_MS = 40;
const MAX_WIDTH = 120;

// ANSI escape sequences (\u001b is the ESC control character).
const HIDE_CURSOR = "\u001b[?25l";
const SHOW_CURSOR = "\u001b[?25h";
const CLEAR_TO_END_OF_SCREEN = "\u001b[0J";

const DOG_COLOR = "#d9a066";
const BALL_COLOR = "#9bd64a";

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/**
 * Composes one full frame: Jack (with the given leg position) offset `dogX`
 * columns from the left, and a ball `BALL_LEAD` columns ahead of his nose,
 * bouncing up onto `NOSE_ROW - 1` on `ballUp` frames.
 */
function composeFrame({ dogX, legs, ballUp }: { dogX: number; legs: readonly string[]; ballUp: boolean }): string {
    const ballRow = ballUp ? NOSE_ROW - 1 : NOSE_ROW;
    const ballColumn = dogX + DOG_WIDTH + BALL_LEAD;

    const lines = legs.map((line, row) => {
        const dog = " ".repeat(dogX) + chalk.hex(DOG_COLOR)(line);
        if (row !== ballRow) {
            return dog;
        }
        const padding = " ".repeat(Math.max(0, ballColumn - (dogX + line.length)));
        return dog + padding + chalk.hex(BALL_COLOR)(BALL);
    });

    return lines.join("\n");
}

/**
 * Animates Jack sprinting from the left edge of the terminal to the right,
 * chasing a bouncing ball. Falls back to a single static frame when stdout is
 * not a TTY (e.g. when output is piped) so we never spew escape codes into a log.
 */
export async function runJack(cliContext: CliContext): Promise<void> {
    cliContext.instrumentPostHogEvent({
        command: "fern jack"
    });

    const greeting = chalk.bold("\nWoof! Thanks for the throw — Jack, the office labradoodle. 🎾\n");
    const width = Math.min(process.stdout.columns ?? 80, MAX_WIDTH);
    const finishX = Math.max(0, width - DOG_WIDTH - BALL_LEAD - 2);

    if (!process.stdout.isTTY) {
        process.stdout.write(`${composeFrame({ dogX: 0, legs: DOG_LEGS_GATHERED, ballUp: false })}\n${greeting}\n`);
        return;
    }

    const moveCursorToFrameTop = `\r\u001b[${FRAME_HEIGHT - 1}A`;

    process.stdout.write(HIDE_CURSOR);
    try {
        let step = 0;
        for (let dogX = 0; dogX < finishX; dogX += COLUMNS_PER_STEP) {
            const legs = step % 2 === 0 ? DOG_LEGS_GATHERED : DOG_LEGS_SPREAD;
            const ballUp = step % 2 === 0;
            process.stdout.write(CLEAR_TO_END_OF_SCREEN + composeFrame({ dogX, legs, ballUp }));
            await sleep(SLEEP_BETWEEN_FRAMES_MS);
            process.stdout.write(moveCursorToFrameTop);
            step++;
        }
        // Final frame: Jack has caught up to the ball, standing on all fours.
        process.stdout.write(
            CLEAR_TO_END_OF_SCREEN + composeFrame({ dogX: finishX, legs: DOG_LEGS_GATHERED, ballUp: false })
        );
    } finally {
        process.stdout.write(SHOW_CURSOR);
    }

    process.stdout.write(`\n${greeting}\n`);
}
