import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";

export function HeroPlaceholderBlock() {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,#fff8ea,#f3efe4)]">
      <Badge>Placeholder</Badge>
      <Card.Header>Hero block placeholder</Card.Header>
      <Card.Body>
        Swap this block for the real marketing or product hero once content is approved.
      </Card.Body>
      <Card.Footer>
        <Button tone="neutral">Replace Me</Button>
      </Card.Footer>
    </Card>
  );
}
