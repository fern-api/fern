// Config for the C# dynamic snippets generator
export interface Config {
    // Controls the name of the class that is generated for the full style.
    // By default, the class is named "Examples", i.e.
    //
    // public partial class Examples {
    //     public async Task Example0() {
    //         var client = new Client();
    //         ...
    //     }
    // }
    fullStyleClassName?: string;
    // Controls the name of the method that is generated for the full style.
    // By default, the method is named after the fullStyleClassName (e.g. "Example0").
    fullStyleMethodName?: string;
}
