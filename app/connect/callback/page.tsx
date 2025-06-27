import { env } from "@/lib/env";
import { installIntegration } from "@/lib/partner";
import { createVercelAccount } from "@/lib/partner/api";
import { exchangeExternalCodeForToken } from "@/lib/vercel/external-api";
import { getAccountInfo } from "@/lib/vercel/marketplace-api";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export default async function Page({
	searchParams: { code, next },
}: {
	searchParams: { code: string; next: string };
}) {
	if (!env.VERCEL_EXTERNAL_REDIRECT_URI) {
		throw new Error(
			"VERCEL_EXTERNAL_REDIRECT_URI is not set, cannot connect account",
		);
	}

	const result = await exchangeExternalCodeForToken(
		code,
		env.VERCEL_EXTERNAL_REDIRECT_URI,
	);

	const accountInfo = await getAccountInfo(result.installation_id);

	await installIntegration(result.installation_id, {
		type: "external",
		scopes: [],
		acceptedPolicies: {},
		credentials: {
			access_token: result.access_token,
			token_type: result.token_type,
		},
	});

	try {
		const jigsawstackAccount = await createVercelAccount({
			email: accountInfo.contact.email,
			name: accountInfo.name,
		});

		// 🆕 Store the JigsawStack account details locally
		await kv.set(`${result.installation_id}:jigsawstack`, {
			user_id: jigsawstackAccount.user.id,
			project_id: jigsawstackAccount.project.id,
			api_key: jigsawstackAccount.api_key.key,
			created_at: new Date().toISOString(),
		});

		console.log("✅ Successfully created JigsawStack account");
	} catch (error) {
		console.error("❌ Failed to create JigsawStack account", error);
	}

	return (
		<div className="space-y-10 text-center p-10">
			<h1 className="text-lg font-medium">Account is connected. ✅</h1>
			<h3>
				<a className="underline text-blue-500" href={next}>
					Redirect me back to Vercel
				</a>
			</h3>
		</div>
	);
}
