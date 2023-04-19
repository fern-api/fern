import FormData from "form-data";

export async function getFormDataContentLength(formData: FormData): Promise<number> {
    return new Promise((resolve, reject) => {
        formData.getLength((err, length) => {
            if (err != null) {
                reject(err);
            } else {
                resolve(length);
            }
        });
    });
}
