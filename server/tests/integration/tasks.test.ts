import request from "supertest";
import { createApp } from "../../src/app";
import { clearTestDb, connectTestDb, disconnectTestDb, hasTestDatabase } from "./setup";

const maybeDescribe = hasTestDatabase ? describe : describe.skip;

maybeDescribe("Task API (integration)", () => {
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

  async function registerAndLogin(email: string) {
    const res = await request(app).post("/api/auth/register").send({
      name: "User",
      email,
      password: "password123",
      confirmPassword: "password123",
    });
    return res.body.data.token as string;
  }

  function authHeader(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  it("rejects task access without a token", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("creates and retrieves a task for the authenticated user", async () => {
    const token = await registerAndLogin("owner@example.com");

    const createRes = await request(app)
      .post("/api/tasks")
      .set(authHeader(token))
      .send({
        title: "Write the README",
        dateTime: new Date().toISOString(),
        deadline: new Date(Date.now() + 3600_000).toISOString(),
        priority: "HIGH",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.title).toBe("Write the README");
    expect(createRes.body.data.urgency).toBeDefined();

    const listRes = await request(app).get("/api/tasks").set(authHeader(token));
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
  });

  it("rejects creating a task with a deadline before its dateTime", async () => {
    const token = await registerAndLogin("owner2@example.com");

    const res = await request(app)
      .post("/api/tasks")
      .set(authHeader(token))
      .send({
        title: "Bad task",
        dateTime: new Date(Date.now() + 3600_000).toISOString(),
        deadline: new Date().toISOString(),
      });

    expect(res.status).toBe(400);
  });

  it("prevents one user from reading, editing, or deleting another user's task", async () => {
    const ownerToken = await registerAndLogin("owner3@example.com");
    const strangerToken = await registerAndLogin("stranger@example.com");

    const createRes = await request(app)
      .post("/api/tasks")
      .set(authHeader(ownerToken))
      .send({
        title: "Private task",
        dateTime: new Date().toISOString(),
        deadline: new Date(Date.now() + 3600_000).toISOString(),
      });

    const taskId = createRes.body.data._id ?? createRes.body.data.id;

    const getRes = await request(app).get(`/api/tasks/${taskId}`).set(authHeader(strangerToken));
    expect(getRes.status).toBe(404);

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeader(strangerToken))
      .send({ title: "Hijacked" });
    expect(updateRes.status).toBe(404);

    const deleteRes = await request(app).delete(`/api/tasks/${taskId}`).set(authHeader(strangerToken));
    expect(deleteRes.status).toBe(404);

    // Confirm the task is untouched from the real owner's perspective.
    const ownerGetRes = await request(app).get(`/api/tasks/${taskId}`).set(authHeader(ownerToken));
    expect(ownerGetRes.status).toBe(200);
    expect(ownerGetRes.body.data.title).toBe("Private task");
  });

  it("marks a task complete and sets completedAt", async () => {
    const token = await registerAndLogin("completer@example.com");

    const createRes = await request(app)
      .post("/api/tasks")
      .set(authHeader(token))
      .send({
        title: "Finish this",
        dateTime: new Date().toISOString(),
        deadline: new Date(Date.now() + 3600_000).toISOString(),
      });
    const taskId = createRes.body.data._id ?? createRes.body.data.id;

    const completeRes = await request(app).patch(`/api/tasks/${taskId}/complete`).set(authHeader(token));
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe("COMPLETED");
    expect(completeRes.body.data.completedAt).toBeTruthy();
  });

  it("deletes a task", async () => {
    const token = await registerAndLogin("deleter@example.com");

    const createRes = await request(app)
      .post("/api/tasks")
      .set(authHeader(token))
      .send({
        title: "Delete me",
        dateTime: new Date().toISOString(),
        deadline: new Date(Date.now() + 3600_000).toISOString(),
      });
    const taskId = createRes.body.data._id ?? createRes.body.data.id;

    const deleteRes = await request(app).delete(`/api/tasks/${taskId}`).set(authHeader(token));
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/tasks/${taskId}`).set(authHeader(token));
    expect(getRes.status).toBe(404);
  });

  it("returns insights with an honest empty state when there are no tasks", async () => {
    const token = await registerAndLogin("freshuser@example.com");

    const res = await request(app).get("/api/tasks/insights").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.hasEnoughDataForAverage).toBe(false);
    expect(res.body.data.averageCompletionTimeMs).toBeNull();
  });
});
