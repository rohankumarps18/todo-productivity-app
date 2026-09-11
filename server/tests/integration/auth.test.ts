import request from "supertest";
import { createApp } from "../../src/app";
import { clearTestDb, connectTestDb, disconnectTestDb, hasTestDatabase } from "./setup";

const maybeDescribe = hasTestDatabase ? describe : describe.skip;

if (!hasTestDatabase) {
  // eslint-disable-next-line no-console
  console.warn(
    "Skipping auth integration tests: set MONGODB_URI to run them against a real MongoDB instance."
  );
}

maybeDescribe("Auth API (integration)", () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  const validRegistration = {
    name: "Test User",
    email: "test.user@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("registers a new user and returns a token, never the password hash", async () => {
    const res = await request(app).post("/api/auth/register").send(validRegistration);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.user.email).toBe(validRegistration.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("rejects registration with a mismatched confirm password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validRegistration, confirmPassword: "somethingElse" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(validRegistration);
    const res = await request(app).post("/api/auth/register").send(validRegistration);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(validRegistration);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validRegistration.email, password: validRegistration.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe("string");
  });

  it("rejects login with the wrong password", async () => {
    await request(app).post("/api/auth/register").send(validRegistration);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validRegistration.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("rejects login for an email that was never registered", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever123" });

    expect(res.status).toBe(401);
  });
});
