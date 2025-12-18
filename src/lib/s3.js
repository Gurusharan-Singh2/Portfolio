import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";


const s3Client = new S3Client({
  endpoint: "https://s3.tebi.io",     
  region: process.env.TEBI_REGION || "us-east-1", 
  forcePathStyle: true,             
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY_ID,         
    secretAccessKey: process.env.TEBI_SECRET_ACCESS_KEY, 
  },
});

const BUCKET_NAME = process.env.TEBI_S3_BUCKET_NAME;


export async function uploadToS3(fileBuffer, originalFilename, contentType) {
  try {
    const ext = originalFilename.split(".").pop();
    const key = `projects/${uuidv4()}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

   
    return `https://${BUCKET_NAME}.s3.tebi.io/${key}`;
  } catch (error) {
    console.error("TEBI upload error:", error);
    throw new Error("Failed to upload image");
  }
}


export async function deleteFromS3(imageUrl) {
  try {
    const url = new URL(imageUrl);
    const key = url.pathname.slice(1);

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error("TEBI delete error:", error);
  }
}


export function isValidImageType(contentType) {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    .includes(contentType.toLowerCase());
}
