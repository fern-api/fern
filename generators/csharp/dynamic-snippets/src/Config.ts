// Config for the C# dynamic snippets generator
export interface Config {
    // Controls the name of the class that is generated for the full style.
    // By default, the class is named "Example", i.e.
    //
    // namespace Usage;
    //
    // class Example {
    //     public static async Do() {
    //         var client = new Client();
    //         ...
    //     }
    // }
    fullStyleClassName?: string
}
