import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import styles from "./JsonExample.module.scss";

const JSON_BLOB =
    '{ "array": [ 1, 2, 3 ], "boolean": true, "null": null, "number": 123, "object": { "a": "b", "c": "d", "e": "f" }, "string": "Hello World" }';

export declare namespace JsonExample {
    export interface Props {
        title: string;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ title }) => {
    return (
        <div className={styles.example}>
            <div className={styles.title}>{title}</div>
            <div className={styles.codeBlock}>
                <SyntaxHighlighter language="json" style={a11yDark}>
                    {JSON.stringify(JSON.parse(JSON_BLOB), undefined, 4)}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
