import * as dotenv from "dotenv";
import { copyLocales } from "../contentful-migrate/space";
dotenv.config();

const sourceSpaceId = process.env.SOURCE_SPACE_ID as string;
const sourceEnvironmentId = process.env.SOURCE_ENVIRONMENT as string;
const targetSpaceId = process.env.TARGET_SPACE_ID as string;
const targetEnvironmentId = process.env.TARGET_ENVIRONMENT as string;

copyLocales({
	sourceSpaceId: sourceSpaceId,
	sourceEnvironmentId: sourceEnvironmentId,
	targetSpaceId: targetSpaceId,
	targetEnvironmentId: targetEnvironmentId,
})
	.then(() => {
		console.log("All locales copied from source space to target space");
	})
	.catch((e) => {
		console.error(e);
	});
