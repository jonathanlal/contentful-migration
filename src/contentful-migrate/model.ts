import type { ContentType } from "contentful-management";
import { getClient } from "./client";

export const copyContentModel = async ({
	sourceSpaceId,
	sourceEnvironmentId,
	targetSpaceId,
	targetEnvironmentId,
	contentType,
}: {
	sourceSpaceId: string;
	sourceEnvironmentId: string;
	targetSpaceId: string;
	targetEnvironmentId: string;
	contentType: string;
}) => {
	const managementClient = await getClient();

	const sourceSpace = await managementClient.getSpace(sourceSpaceId);
	const sourceEnvironment = await sourceSpace.getEnvironment(
		sourceEnvironmentId,
	);
	const sourceContentType = await sourceEnvironment.getContentType(contentType);
	const targetSpace = await managementClient.getSpace(targetSpaceId);
	const targetEnvironment = await targetSpace.getEnvironment(
		targetEnvironmentId,
	);
	const targetContentType = await targetEnvironment.createContentTypeWithId(
		contentType,
		sourceContentType,
	);

	const isPublished = sourceContentType.isPublished();
	if (isPublished) {
		await targetContentType.publish();
	}

	return targetContentType;
};

export interface IDeps {
	contentType: string;
	deps: string[];
}

export function getContentTypeDependencies(
	contentTypes: ContentType[],
): IDeps[] {
	const dependencies: IDeps[] = [];

	const getDeps = (id: string, visited: Set<string> = new Set()): string[] => {
		if (visited.has(id)) {
			return [];
		}
		visited.add(id);

		const contentType = contentTypes.find(
			(contentType) => contentType.sys.id === id,
		);
		if (!contentType) {
			return [];
		}

		const deps: string[] = [];
		contentType.fields.forEach(({ linkType, validations }) => {
			if (linkType && (linkType === "Entry" || linkType === "Asset")) {
				const validation = validations?.find(
					(validation) => validation.linkContentType,
				);
				if (validation?.linkContentType) {
					deps.push(...validation.linkContentType);
				}
				if (linkType === "Asset") {
					deps.push("Media");
				}
			}
		});

		const nestedDeps = deps.flatMap((dep) => getDeps(dep, visited));
		return Array.from(new Set([...deps, ...nestedDeps]));
	};

	contentTypes.forEach(({ sys: { id } }) => {
		const deps = getDeps(id);
		if (deps.length > 0) {
			dependencies.push({
				contentType: id,
				deps: Array.from(new Set(deps)), // Remove duplicates
			});
		}
	});

	return dependencies;
}

export const getAllContentTypes = async ({
	spaceId,
	environmentId,
}: {
	spaceId: string;
	environmentId: string;
}): Promise<ContentType[]> => {
	const managementClient = await getClient();
	const contentTypes = await managementClient
		.getSpace(spaceId)
		.then((space) => space.getEnvironment(environmentId))
		.then((environment) => environment.getContentTypes());

	return contentTypes.items;
};
