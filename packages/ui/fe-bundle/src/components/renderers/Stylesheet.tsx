/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function StyleSheet({ stylesheet }: { stylesheet: string }) {
    return (
        // eslint-disable-next-line react/no-unknown-property
        <style id="fern-stylesheets" jsx global>
            {stylesheet}
        </style>
    );
}
