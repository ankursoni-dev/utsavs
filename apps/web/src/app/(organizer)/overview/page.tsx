import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

export default function OrganizerOverview() {
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <Eyebrow>Overview</Eyebrow>
        <Display size="lg">Your portfolio at a glance</Display>
      </div>
      <Card accent="var(--color-emerald)">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <Eyebrow>Active events</Eyebrow>
            <Chip status="healthy">on track</Chip>
          </div>
          <p className="text-text-muted">
            No data yet — this is the organizer overview placeholder.
          </p>
          <Button variant="emerald" size="md">
            Create event
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
