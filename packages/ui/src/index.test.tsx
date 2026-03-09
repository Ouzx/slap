import { render, screen } from "@testing-library/react";

import { Badge, Button, Card, Input, Label } from "./index";

describe("ui", () => {
  test("renders base components with semantic defaults", () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="name@example.com" />
        <Button>Continue</Button>
        <Badge tone="success">Ready</Badge>
      </div>,
    );

    expect(screen.getByText("Email").tagName).toBe("LABEL");
    expect(screen.getByPlaceholderText("name@example.com").getAttribute("id")).toBe("email");
    expect(screen.getByRole("button", { name: "Continue" })).toBeDefined();
    expect(screen.getByText("Ready")).toBeDefined();
  });

  test("renders card slots", () => {
    render(
      <Card>
        <Card.Header>Title</Card.Header>
        <Card.Body>Content</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );

    expect(screen.getByText("Title")).toBeDefined();
    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.getByText("Footer")).toBeDefined();
  });
});
