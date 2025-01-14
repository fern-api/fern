export function getFileExtension(filename: string): string | undefined {
    const extBeginsIndex = filename.lastIndexOf(".") + 1;
    const ext = filename.substring(extBeginsIndex);

    if (filename === ext) {return undefined;}
    return ext.toLowerCase();
}
