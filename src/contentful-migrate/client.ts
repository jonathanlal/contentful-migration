import contentfulManagement from "contentful-management";

const getEnvVar = (): string | undefined => {
	let value = process.env.VITE_CONTENTFUL_MANAGEMENT_API_KEY;
	if (!value) {
		return import.meta.env.VITE_CONTENTFUL_MANAGEMENT_API_KEY;
	} 
	return value;
};

export const getClient = async () => {
	const accessToken = getEnvVar() as string;
	return contentfulManagement.createClient({
		accessToken,
	});
};
