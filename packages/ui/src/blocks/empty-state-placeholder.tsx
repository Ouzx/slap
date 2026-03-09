import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";

export function EmptyStatePlaceholderBlock() {
  return (
    <Card>
      <Badge tone="warning">Placeholder</Badge>
      <Card.Header>Empty state placeholder</Card.Header>
      <Card.Body>
        Use this while the final illustration, copy, and actions are still being defined.
      </Card.Body>
      <Card.Footer>
        <Button>Primary Action</Button>
      </Card.Footer>
    </Card>
  );
}
