import { Button } from '@/components/ui/button';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <Eyebrow>Auth · login</Eyebrow>
      <Display size="md" as="h1">
        Sign in with your phone
      </Display>
      <p className="text-sm text-text-muted">
        We&apos;ll send you a one-time code via WhatsApp or SMS. No password.
      </p>
      <Button variant="primary" size="lg" fullWidth>
        Send code (placeholder)
      </Button>
    </div>
  );
}
