import * as validators from "./index";

describe("validators index", () => {
  test("re-exports schema modules", () => {
    expect(validators.LoginSchema).toBeDefined();
    expect(validators.ProfileUpdateSchema).toBeDefined();
    expect(validators.CheckoutSchema).toBeDefined();
    expect(validators.RichTextDocumentSchema).toBeDefined();
  });
});
