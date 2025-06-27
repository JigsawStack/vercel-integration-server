import { env } from "../env";

export interface CreateVercelAccountRequest {
	vercel_user_id: string;
	email: string;
	name?: string;
	vercel_team_id?: string;
	avatar_url?: string;
}

export interface CreateVercelAccountResponse {
	success: boolean;
	user: {
		id: string;
		email: string;
		name: string;
		is_new_user: boolean;
	};
	project: {
		id: string;
		name: string;
	};
	api_key: {
		id: string;
		key: string;
		created_at: string;
	};
}

export async function createVercelAccount(
	data: CreateVercelAccountRequest,
): Promise<CreateVercelAccountResponse> {
	const response = await fetch(
		`${env.JIGSAWSTACK_API_URL}/v1/integrations/vercel/accounts`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.JIGSAWSTACK_ADMIN_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Failed to create JigsawStack account: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return response.json();
}
