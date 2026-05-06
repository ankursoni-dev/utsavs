import { Button } from '@/components/ui/button';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <Eyebrow>Auth · verify</Eyebrow>
      <Display size="md" as="h1">
        Enter your code
      </Display>
      <p className="text-sm text-text-muted">
        Six digits, valid for ten minutes.
      </p>
      <Button variant="champagne" size="lg" fullWidth>
        Verify (placeholder)
      </Button>
    </div>
  );
}
