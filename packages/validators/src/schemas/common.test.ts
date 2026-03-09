import {
  CursorPaginationSchema,
  DateRangeSchema,
  PaginationSchema,
  SlapIdSchema,
} from "./common";

describe("common schemas", () => {
  test("accepts slap ids", () => {
    expect(SlapIdSchema.parse("cjfne9x7k0000m8w4p4f8u2j2")).toBe(
      "cjfne9x7k0000m8w4p4f8u2j2",
    );
  });

  test("applies pagination defaults", () => {
    const parsed = PaginationSchema.parse({});

    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });

  test("rejects inverted date ranges", () => {
    const result = DateRangeSchema.safeParse({
      from: "2026-03-02T00:00:00.000Z",
      to: "2026-03-01T00:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  test("accepts cursor pagination with null cursors", () => {
    const parsed = CursorPaginationSchema.parse({
      cursor: null,
      limit: 50,
    });

    expect(parsed.cursor).toBeNull();
  });
});
