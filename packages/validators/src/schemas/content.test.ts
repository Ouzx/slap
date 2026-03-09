import {
  RichTextDocumentSchema,
  RichTextDocumentCreateSchema,
  RichTextDocumentUpdateSchema,
} from "./content";

const sampleDocument = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Hello world" }],
    },
  ],
};

describe("content schemas", () => {
  test("accepts document creation payloads", () => {
    const parsed = RichTextDocumentCreateSchema.parse({
      title: "Launch notes",
      document: sampleDocument,
    });

    expect(parsed.document.type).toBe("doc");
  });

  test("rejects empty documents", () => {
    const result = RichTextDocumentSchema.safeParse({
      type: "doc",
      content: [],
    });

    expect(result.success).toBe(false);
  });

  test("requires an id for updates", () => {
    const result = RichTextDocumentUpdateSchema.safeParse({
      title: "Draft",
      document: sampleDocument,
    });

    expect(result.success).toBe(false);
  });
});
