// Config for the Java dynamic snippets generator
export interface Config {
    // Controls the name of the class that is generated for the full style.
    // By default, the class is named "Example", i.e.
    //
    // package com.example.usage;
    //
    // class Example {
    //     public static void do() {
    //         var client = new Client();
    //         ...
    //     }
    // }
    fullStyleClassName?: string
    fullStylePackageName?: string
}
