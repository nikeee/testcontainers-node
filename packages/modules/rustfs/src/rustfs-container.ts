import { AbstractStartedContainer, GenericContainer, type StartedTestContainer, Wait } from "testcontainers";

const S3_PORT = 9000;
const ACCESS_KEY_ID = "rustfsadmin";
const SECRET_ACCESS_KEY = "rustfsadmin";

export class RustFSContainer extends GenericContainer {
  #accessKeyId: string = ACCESS_KEY_ID;
  #secretAccessKey: string = SECRET_ACCESS_KEY;

  constructor(image: string) {
    super(image);
    this.withExposedPorts(S3_PORT);
    this.withWaitStrategy(Wait.forHttp("/", S3_PORT));
  }

  withAccessKeyId(accessKeyId: string): this {
    this.#accessKeyId = accessKeyId;
    return this;
  }
  withSecretAccessKey(secretAccessKey: string): this {
    this.#secretAccessKey = secretAccessKey;
    return this;
  }

  override async start(): Promise<StartedRustFSContainer> {
    this.withEnvironment({
      RUSTFS_ACCESS_KEY: this.#accessKeyId,
      RUSTFS_SECRET_KEY: this.#secretAccessKey,
    });

    const startedContainer = await super.start();
    return new StartedRustFSContainer(startedContainer, this.#accessKeyId, this.#secretAccessKey, S3_PORT);
  }
}

export class StartedRustFSContainer extends AbstractStartedContainer {
  readonly #accessKeyId: string;
  readonly #secretAccessKey: string;
  readonly #s3Port: number;

  constructor(startedContainer: StartedTestContainer, accessKeyId: string, secretAccessKey: string, s3Port: number) {
    super(startedContainer);
    this.#accessKeyId = accessKeyId;
    this.#secretAccessKey = secretAccessKey;
    this.#s3Port = s3Port;
  }

  getPort() {
    return this.startedTestContainer.getMappedPort(this.#s3Port);
  }
  getAccessKeyId(): string {
    return this.#accessKeyId;
  }
  getSecretAccessKey(): string {
    return this.#secretAccessKey;
  }
  getConnectionUrl() {
    return `http://${this.getHost()}:${this.getPort()}`;
  }
}
