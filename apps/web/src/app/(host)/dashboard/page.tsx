import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

export default function HostDashboard() {
  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name="Riya Mehta" size="xl" ring />
        <div className="space-y-1">
          <Eyebrow>Host dashboard</Eyebrow>
          <Display size="lg">Riya &amp; Arjun</Display>
        </div>
      </div>
      <Card>
        <CardBody className="space-y-3">
          <Eyebrow>Up next</Eyebrow>
          <p className="text-text-muted">
            Placeholder — your checklist, RSVP summary, and shagun overview will
            live here.
          </p>
          <Button variant="champagne" size="md" pill>
            View checklist
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
