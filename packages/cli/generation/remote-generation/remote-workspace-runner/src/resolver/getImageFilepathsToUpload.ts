import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

// interface AbsoluteImageFilePath {
//     filePath: AbsoluteFilePath;
//     width: number;
//     height: number;
//     blurDataUrl: string | undefined;
// }

// type ImageFile = ImageFileAbsoluteFilePath | ImageFileMetadata;

// interface ImageFileAbsoluteFilePath {
//     type: "filepath";
//     value: AbsoluteFilePath;
// }
// function isFilePath(imageFile: ImageFile): imageFile is ImageFileAbsoluteFilePath {
//     return imageFile.type === "filepath";
// }

// interface ImageFileMetadata {
//     type: "image";
//     value: AbsoluteImageFilePath;
// }
// function isImage(imageFile: ImageFile): imageFile is ImageFileMetadata {
//     return imageFile.type === "image";
// }

// const sizeOf = promisify(imageSize);

export function collectFilesFromDocsConfig(parsedDocsConfig: docsYml.ParsedDocsConfiguration): Set<AbsoluteFilePath> {
    const filepaths = new Set<AbsoluteFilePath>();

    // branding images
    if (parsedDocsConfig.logo?.dark != null) {
        filepaths.add(parsedDocsConfig.logo.dark);
    }

    if (parsedDocsConfig.logo?.light != null) {
        filepaths.add(parsedDocsConfig.logo.light);
    }

    if (parsedDocsConfig.favicon != null) {
        filepaths.add(parsedDocsConfig.favicon);
    }

    if (parsedDocsConfig.backgroundImage?.dark != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.dark);
    }

    if (parsedDocsConfig.backgroundImage?.light != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.light);
    }

    // opengraph images
    if (parsedDocsConfig.metadata?.["og:image"] != null && parsedDocsConfig.metadata["og:image"].type === "filepath") {
        filepaths.add(parsedDocsConfig.metadata["og:image"].value);
    }

    if (parsedDocsConfig.metadata?.["og:logo"] != null && parsedDocsConfig.metadata["og:logo"].type === "filepath") {
        filepaths.add(parsedDocsConfig.metadata["og:logo"].value);
    }

    if (
        parsedDocsConfig.metadata?.["twitter:image"] != null &&
        parsedDocsConfig.metadata["twitter:image"].type === "filepath"
    ) {
        filepaths.add(parsedDocsConfig.metadata["twitter:image"].value);
    }

    // javascript files
    if (parsedDocsConfig.js != null) {
        parsedDocsConfig.js.files.forEach((file) => {
            filepaths.add(file.absolutePath);
        });
    }

    return filepaths;

    // // measure the size of the images, 10 at a time
    // const filepathChunks = chunk([...filepaths], 10);
    // const imageFilepathsAndSizesToUpload: ImageFile[] = [];
    // for (const filepaths of filepathChunks) {
    //     const chunk: ImageFile[] = await Promise.all(
    //         filepaths.map(async (filePath): Promise<ImageFile> => {
    //             try {
    //                 const size = await sizeOf(filePath);
    //                 if (size == null || size.height == null || size.width == null) {
    //                     return { type: "filepath", value: filePath };
    //                 }
    //                 return {
    //                     type: "image",
    //                     value: { filePath, width: size.width, height: size.height, blurDataUrl: undefined }
    //                 };
    //             } catch (e) {
    //                 return { type: "filepath", value: filePath };
    //             }
    //         })
    //     );

    //     imageFilepathsAndSizesToUpload.push(...chunk);
    // }

    // const imagesWithSize = imageFilepathsAndSizesToUpload.filter(isImage).map((image) => image.value);
    // const imagesWithoutSize = imageFilepathsAndSizesToUpload.filter(isFilePath).map((image) => image.value);

    // return [imagesWithSize, imagesWithoutSize];
}
