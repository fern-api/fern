export interface GeneratedFile<Context> {
    writeToFile: (context: Context) => void;
}
