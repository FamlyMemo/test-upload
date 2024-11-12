import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { NextResponse } from "next/server";

const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION;
const awsBucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
const awsAccessID = process.env.AWS_ACCESS_ID;
const awsSecretID = process.env.AWS_SECRET_ID;

if (!awsRegion || !awsBucket || !awsAccessID || !awsSecretID) {
  throw new Error("Missing AWS environment variables");
}

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessID,
    secretAccessKey: awsSecretID,
  },
  useAccelerateEndpoint: true,
  logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }, // Disable SDK logging
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${file.name}`;
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: awsBucket,
        Key: key,
        Body: file,
        ContentType: file.type,
      },
      // Optimize multipart upload
      partSize: 1 * 1024 * 1024, // Increased to 10MB parts for faster uploads
      queueSize: 4, // Increased concurrent uploads
      leavePartsOnError: false,
    });

    await upload.done();

    return NextResponse.json({
      message: "Upload successful",
      url: `https://${awsBucket}.s3-accelerate.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
