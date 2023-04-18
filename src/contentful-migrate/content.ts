import type { Entry } from "contentful-management";
import { getClient } from "./client";

export const getTotalEntries = async ({
	contentType,
	spaceId,
	environmentId,
}: {
	contentType: string;
	spaceId: string;
	environmentId: string;
}) => {
	try {
		const managementClient = await getClient();
		const entries = await managementClient
			.getSpace(spaceId)
			.then((space) => space.getEnvironment(environmentId))
			.then((environment) =>
				environment.getEntries({ content_type: contentType }),
			);
		return entries.total;
	} catch (e) {
		console.error(
			`Error fetching total entries from the Content Management API: ${e}`,
		);
		return 0;
	}
};

export const getEntries = async ({
	contentType,
	spaceId,
	environmentId,
	skip,
	limit,
}: {
	contentType: string;
	spaceId: string;
	environmentId: string;
	limit: number;
	skip: number;
}) => {
	try {
		const managementClient = await getClient();
		const entries = await managementClient
			.getSpace(spaceId)
			.then((space) => space.getEnvironment(environmentId))
			.then((environment) =>
				environment.getEntries({
					content_type: contentType,
					skip,
					limit,
					locale: "*",
				}),
			);
		return entries.items;
	} catch (e) {
		console.error(
			`Error fetching entries from the Content Management API: ${e}`,
		);
		return [];
	}
};

export const isEntryPublished = async ({
	entryId,
	spaceId,
	environmentId,
}: {
	entryId: string;
	spaceId: string;
	environmentId: string;
}) => {
	try {
		const managementClient = await getClient();
		const entry = await managementClient
			.getSpace(spaceId)
			.then((space) => space.getEnvironment(environmentId))
			.then((environment) => environment.getEntry(entryId));
		return entry.isPublished();
	} catch (e) {
		console.error(
			`Error fetching entry ${entryId} from the Content Management API: ${e}`,
		);
		return false;
	}
};

export const entryExists = async ({
	entryId,
	spaceId,
	environmentId,
}: {
	entryId: string;
	spaceId: string;
	environmentId: string;
}) => {
	try {
		const managementClient = await getClient();
		const entry = await managementClient

			.getSpace(spaceId)
			.then((space) => space.getEnvironment(environmentId))
			.then((environment) => environment.getEntry(entryId))
			.then((entry) => entry)
			.catch(() => false);
		return entry;
	} catch (e) {
		console.error(
			`Error fetching entry ${entryId} from the Content Management API: ${e}`,
		);
		return false;
	}
};

export const createEntry = async ({
	entryId,
	spaceId,
	environmentId,
	entryAttributes,
	isPublished,
}: {
	entryId: string;
	spaceId: string;
	environmentId: string;
	entryAttributes: {
		content_type_id: string;
		fields: object;
	};
	isPublished: boolean;
}) => {
	try {
		const managementClient = await getClient();
		const environment = await managementClient
			.getSpace(spaceId)
			.then((space) => space.getEnvironment(environmentId));

		const alreadyExists = await entryExists({
			entryId,
			spaceId,
			environmentId,
		});

		if (alreadyExists) {
			const currentEntry = alreadyExists as Entry;
			currentEntry.fields = entryAttributes.fields;
			currentEntry.update();
			return `Entry ${entryId} already exists.`;
		} else {
			const newEntry = await environment.createEntryWithId(
				entryAttributes.content_type_id,
				entryId,
				entryAttributes,
			);
			if (isPublished) {
				await newEntry.publish();
				return `Entry ${entryId} created & published.`;
			} else {
				return `Entry ${entryId} created & saved as draft.`;
			}
		}
	} catch (e: any) {
		console.log("error", e);
		return `Error creating entry ${entryId}: ${e}`;
	}
};

export const copyContent = async ({
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
	try {
		const limitBy = 1000;
		const totalEntries =
			(await getTotalEntries({
				contentType,
				spaceId: sourceSpaceId,
				environmentId: sourceEnvironmentId,
			})) || 0;

		let processedEntries = 0;
		while (processedEntries < totalEntries) {
			const entries = await getEntries({
				contentType,
				spaceId: sourceSpaceId,
				environmentId: sourceEnvironmentId,
				skip: processedEntries,
				limit: limitBy,
			});
			if (!entries) break;
			for (const [, entry] of entries.entries()) {
				const entryId = entry.sys.id;
				const fields = entry.fields;
				const entryAttributes = {
					content_type_id: contentType,
					fields: fields,
				};
				const isPublished = await isEntryPublished({
					entryId,
					spaceId: sourceSpaceId,
					environmentId: sourceEnvironmentId,
				});
				const result = await createEntry({
					entryId,
					spaceId: targetSpaceId,
					environmentId: targetEnvironmentId,
					entryAttributes,
					isPublished: isPublished || false,
				});
				const log = `(${processedEntries}/${totalEntries}) - ${result}`;
				console.log(log);
				processedEntries++;
			}
		}
	} catch (e) {
		console.error(`Error copying content: ${e}`);
	}
};
