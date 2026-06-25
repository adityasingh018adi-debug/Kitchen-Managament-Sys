import { Card } from "@/components/card";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <Card className="mt-6">
        <p className="text-sm text-neutral-400">
          The data model and API for this module are already in place. The UI is the next
          increment on the roadmap — see the root README for what is implemented vs. planned.
        </p>
      </Card>
    </div>
  );
}
