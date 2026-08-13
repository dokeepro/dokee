import AWS from "aws-sdk";

const s3 = new AWS.S3({
    endpoint: "https://351efc4ab41db8b9c50631315063682f.r2.cloudflarestorage.com",
    accessKeyId: "f0576931b32e30002db9a3ac4a531193",
    secretAccessKey: "9a7707eedca5c4c35bae4563b8f7c3c17f430b5f455df45c6eafe4f3b7f95d8b",
    signatureVersion: "v4",
    s3ForcePathStyle: true,
});

export async function uploadImage(
    buffer: Buffer,
    fileName: string,
    contentType = "application/octet-stream",
): Promise<string> {
    if (!buffer) throw new Error("Файл отсутствует");

    await s3
        .upload({
            Bucket: "images",
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
            ACL: "public-read",
        })
        .promise();

    return `https://cdn.allship.ai/${fileName}`;
}
