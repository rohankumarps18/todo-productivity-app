import { validateRegisterInput, validateLoginInput } from "../../src/validators/authValidators";

describe("validateRegisterInput", () => {
  it("accepts a valid registration payload", () => {
    const result = validateRegisterInput({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret1",
      confirmPassword: "supersecret1",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects a mismatched confirm password", () => {
    const result = validateRegisterInput({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret1",
      confirmPassword: "different",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /match/i.test(e))).toBe(true);
  });

  it("rejects a short password", () => {
    const result = validateRegisterInput({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = validateRegisterInput({
      name: "Ada",
      email: "not-an-email",
      password: "supersecret1",
      confirmPassword: "supersecret1",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateLoginInput", () => {
  it("accepts a valid login payload", () => {
    expect(validateLoginInput({ email: "a@b.com", password: "x" }).valid).toBe(true);
  });

  it("rejects a missing password", () => {
    expect(validateLoginInput({ email: "a@b.com" }).valid).toBe(false);
  });
});
