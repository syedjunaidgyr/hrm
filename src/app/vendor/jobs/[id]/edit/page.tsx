import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobById } from "@/services/job.service";
import { EditJobForm } from "@/components/forms/EditJobForm";
import { notFound } from "next/navigation";

export default async function VendorEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireVendor();
  const { id: jobId } = await params;

  let job;
  try {
    job = await getJobById(jobId, user.vendorId);
  } catch {
    notFound();
  }

  return (
    <DashboardLayout user={user}>
      <EditJobForm
        job={{
          id: job.id,
          title: job.title,
          department: job.department ?? null,
          disciplineId: (job as any).discipline?.id ?? job.disciplineId ?? null,
          projectId: (job as any).project?.id ?? job.projectId ?? null,
          location: job.location,
          employmentType: job.employmentType,
          workMode: job.workMode,
          minExperience: job.minExperience,
          maxExperience: job.maxExperience,
          numPositions: job.numPositions,
          deliveredQty: job.deliveredQty,
          minSalary: job.minSalary ?? null,
          maxSalary: job.maxSalary ?? null,
          requiredSkills: job.requiredSkills,
          preferredSkills: job.preferredSkills ?? null,
          description: job.description,
          responsibilities: job.responsibilities ?? null,
          requirements: job.requirements ?? null,
          noticePeriod: job.noticePeriod ?? null,
          priority: job.priority,
          status: job.status,
          dateReceived: job.dateReceived ? String(job.dateReceived) : null,
          dateClosed: job.dateClosed ? String(job.dateClosed) : null,
          additionalNotes: job.additionalNotes ?? null,
        }}
        patchUrl={`/api/vendor/jobs/${jobId}`}
        backUrl={`/vendor/jobs/${jobId}`}
        showStatus={true}
      />
    </DashboardLayout>
  );
}
