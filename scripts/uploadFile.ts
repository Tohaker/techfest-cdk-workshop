import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client();

const putObjectCommand = new PutObjectCommand({
	Bucket: "pipeline-bucket",
	Key: "example.json",
	Body: JSON.stringify({ hello: "world" }),
});

await client.send(putObjectCommand);
