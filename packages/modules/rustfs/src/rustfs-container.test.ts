import { CreateBucketCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { getImage } from "../../../testcontainers/src/utils/test-helper";
import { RustFSContainer } from "./rustfs-container";

const IMAGE = getImage(__dirname);

describe("RustFSContainer", { timeout: 180_000 }, () => {
  it("should create a S3 bucket", async () => {
    // rustfsCreateS3Bucket {
    await using container = await new RustFSContainer(IMAGE).start();

    const client = new S3Client({
      endpoint: container.getConnectionUrl(),
      forcePathStyle: true,
      region: "auto",
      credentials: {
        secretAccessKey: container.getSecretAccessKey(),
        accessKeyId: container.getAccessKeyId(),
      },
    });

    const input = { Bucket: "testcontainers" };
    const command = new CreateBucketCommand(input);

    expect((await client.send(command)).$metadata.httpStatusCode).toEqual(200);
    expect((await client.send(new HeadBucketCommand(input))).$metadata.httpStatusCode).toEqual(200);
    // }
  });
});
