import { copyContentModel } from '../contentful-migrate/model';
import * as dotenv from 'dotenv';
dotenv.config();

const args = process.argv.slice(2);
const content_type = args.length ? args[0].replace('content_type=', '') : '';
const sourceSpaceId = process.env.VITE_SOURCE_SPACE_ID as string;
const sourceEnvironmentId = process.env.VITE_SOURCE_ENVIRONMENT as string;
const targetSpaceId = process.env.VITE_TARGET_SPACE_ID as string;
const targetEnvironmentId = process.env.VITE_TARGET_ENVIRONMENT as string;

copyContentModel({
  sourceSpaceId: sourceSpaceId,
  sourceEnvironmentId: sourceEnvironmentId,
  targetSpaceId: targetSpaceId,
  targetEnvironmentId: targetEnvironmentId,
  contentType: content_type,
})
  .then((newContentModel) => {
    console.log(
      `New content model created in target space: '${newContentModel.name}'`
    );
  })
  .catch((e) => {
    console.error(e);
  });
