import { copyContent } from "../contentful-migrate/content";
import * as dotenv from "dotenv";
dotenv.config();

const args = process.argv.slice(2);
const content_type = args.length ? args[0].replace("content_type=", "") : "";
const sourceSpaceId = process.env.SOURCE_SPACE_ID as string;
const sourceEnvironmentId = process.env.SOURCE_ENVIRONMENT as string;
const targetSpaceId = process.env.TARGET_SPACE_ID as string;
const targetEnvironmentId = process.env.TARGET_ENVIRONMENT as string;

copyContent({
	sourceSpaceId: sourceSpaceId,
	sourceEnvironmentId: sourceEnvironmentId,
	targetSpaceId: targetSpaceId,
	targetEnvironmentId: targetEnvironmentId,
	contentType: content_type,
})
	.then(() => {
		console.log(`Content finished copying to target space.`);
	})
	.catch((e) => {
		console.error(e);
	});
