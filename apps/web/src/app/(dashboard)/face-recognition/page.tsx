import Link from "next/link";
import { Card } from "@/components/card";

export default function FaceRecognitionPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Face Recognition</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Enrollment and kiosk recognition are wired through a swappable{" "}
        <code className="text-neutral-400">FACE_RECOGNITION_PROVIDER</code> interface. The current
        implementation is a deterministic mock (enroll succeeds, recognize never matches) — swap in a
        real SDK (AWS Rekognition, Azure Face, etc.) by rebinding the provider in{" "}
        <code className="text-neutral-400">AiModule</code>, no controller changes required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-white">Enroll an employee&apos;s face</p>
          <p className="mt-1 text-sm text-neutral-400">
            Open a camera capture from the Employees page and save a reference photo.
          </p>
          <Link
            href="/employees"
            className="mt-3 inline-block rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Go to Employees
          </Link>
        </Card>
        <Card>
          <p className="text-sm font-medium text-white">Attendance kiosk recognition</p>
          <p className="mt-1 text-sm text-neutral-400">
            Scan a face at punch-in/out time, with manual selection as a fallback.
          </p>
          <Link
            href="/attendance"
            className="mt-3 inline-block rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Go to Attendance Kiosk
          </Link>
        </Card>
      </div>
    </div>
  );
}
