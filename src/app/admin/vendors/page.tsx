import { redirect } from "next/navigation";

// Legacy URL — redirect to the renamed Clients page
export default function AdminVendorsRedirectPage() {
  redirect("/admin/clients");
}
