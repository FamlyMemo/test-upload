import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    const key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: awsBucket,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return NextResponse.json({
      uploadUrl: signedUrl,
      fileKey: key,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
