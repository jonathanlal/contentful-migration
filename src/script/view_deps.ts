import {
  getAllContentTypes,
  getContentTypeDependencies,
} from '../contentful-migrate/model';
import * as dotenv from 'dotenv';

dotenv.config();

const args = process.argv.slice(2);
const content_type = args.length ? args[0].replace('content_type=', '') : '';

const sourceSpaceId = process.env.VITE_SOURCE_SPACE_ID as string;
const sourceEnvironmentId = process.env.VITE_SOURCE_ENVIRONMENT as string;

getAllContentTypes({
  spaceId: sourceSpaceId,
  environmentId: sourceEnvironmentId,
}).then((types) => {
  const deps = getContentTypeDependencies(types);

  if (content_type) {
    console.log(
      deps.find((type) => type.contentType === content_type)?.deps.join(', ') ||
        'none'
    );
  } else {
    console.log(deps);
  }
});
