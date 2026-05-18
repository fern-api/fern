export interface Foo {
    bar?: (string | null) | undefined;
    nullable_bar?: (string | null) | undefined;
    nullable_required_bar: string | null;
    required_bar: string;
}
