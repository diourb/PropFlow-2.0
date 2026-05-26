import { PageHeader } from "@/components/app/page-header";
import { AvatarUpload } from "@/components/app/avatar-upload";
import { SectionCard } from "@/components/app/section-card";
import { getOperationsSnapshot } from "@/lib/data/repository";
import { saveNotificationPreferences, updateProfile } from "@/app/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function savePreferences(formData: FormData) {
  "use server";
  await saveNotificationPreferences(formData);
}

async function saveProfileAction(formData: FormData) {
  "use server";
  await updateProfile(formData);
}

export default async function AccountSettingsPage() {
  const { session } = await getOperationsSnapshot();
  const currentUser = session.user;
  const avatar = currentUser.avatar ?? "/icon.svg";
  const storageEnabled = hasSupabaseEnv();
  const nameParts = currentUser.name.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <>
      <PageHeader
        title="Account Settings"
        description="Manage your personal profile, security, and notification preferences."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-center ambient-shadow">
            <AvatarUpload
              hasStorage={storageEnabled}
              name={currentUser.name}
              src={avatar}
              userId={currentUser.id}
            />
            <h2 className="font-heading text-xl font-semibold text-primary">
              {currentUser.name}
            </h2>
            <p className="text-sm text-on-surface-variant capitalize">
              {session.role.replace(/_/g, " ")}
            </p>
            <span className="mt-3 inline-block rounded-full bg-secondary-container/30 px-3 py-1 text-xs font-semibold text-on-secondary-container">
              {session.role === "platform_admin" ? "Platform Administrator" : "Workspace Member"}
            </span>
          </section>
        </div>
        <div className="space-y-8 lg:col-span-2">
          <SectionCard title="Personal Information">
            <form action={saveProfileAction} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-on-surface-variant">
                    First Name
                  </span>
                  <input
                    className="h-12 w-full rounded-lg border border-outline-variant px-4"
                    defaultValue={firstName}
                    name="firstName"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-on-surface-variant">
                    Last Name
                  </span>
                  <input
                    className="h-12 w-full rounded-lg border border-outline-variant px-4"
                    defaultValue={lastName}
                    name="lastName"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-on-surface-variant">
                  Email Address
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-outline-variant px-4"
                  defaultValue={currentUser.email}
                  name="email"
                  type="email"
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  className="h-11 rounded-lg border border-outline-variant px-6 text-sm font-semibold"
                  type="reset"
                >
                  Cancel
                </button>
                <button
                  className="h-11 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary"
                  type="submit"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </SectionCard>
          <SectionCard title="Notifications">
            <form action={savePreferences} className="space-y-4">
              {[
                ["email", "Email summaries", "Receive daily performance overviews."],
                ["sms", "SMS maintenance alerts", "Urgent issues are sent to your phone."],
                ["push", "PWA push notifications", "Receive installable app push alerts."],
                [
                  "in_app",
                  "In-app notifications",
                  "Show alerts in the PropFlow notification center.",
                ],
              ].map(([name, title, body]) => (
                <label
                  className="flex items-center justify-between border-b border-outline-variant/20 py-3 last:border-0"
                  key={name}
                >
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="text-sm text-on-surface-variant">{body}</span>
                  </span>
                  <input
                    className="h-5 w-5 accent-secondary"
                    defaultChecked
                    name={name}
                    type="checkbox"
                  />
                </label>
              ))}
              <button className="h-11 rounded-lg bg-primary-container px-5 text-sm font-semibold text-on-primary">
                Save Preferences
              </button>
            </form>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
