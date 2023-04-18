import { component$, useStore, useTask$, $ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { Space } from '~/components/Space';
import ContentTypesDropdown from '~/components/ContentTypes';
import { isServer } from '@builder.io/qwik/build';
import {
  getContentTypeDependencies,
} from '~/contentful-migrate/model';
import { copyContentModelSS, copyLocalesSS, createEntrySS, getAllContentTypesSS, getEntriesSS, getLocalesSS, getTotalEntriesSS, isEntryPublishedSS } from '~/utils/ss_requests';

export interface IState {
  source: {
    spaceId: string;
    spaceName: string;
    environmentId?: string;
  };
  target: {
    spaceId: string;
    spaceName: string;
    environmentId?: string;
  };
  contentType: string;
  isLoading?: boolean;
}
interface IInfo {
  contentTypeFieldsMismatch: boolean;
  missingContentType: boolean;
  canContinue: boolean;
  contentTypeDependencies: string[];
  spaceLocalesMismatch: boolean;
  missingLocales: string[];
  loading: boolean;
}


export default component$(() => {
  const store: IState = useStore(
    {
      source: {
        spaceId: '',
        spaceName: '',
      },
      target: {
        spaceId: '',
        spaceName: '',
      },
      contentType: '',
    },
    { deep: true }
  );
  const info: IInfo = useStore({
    contentTypeFieldsMismatch: false,
    missingContentType: false,
    canContinue: false,
    spaceLocalesMismatch: false,
    contentTypeDependencies: [],
    missingLocales: [],
    loading: false,
  });
  const logs: string[] = useStore([]);

  const createLog = $((log: string) => {
    logs.push(
      `${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })} | ${log}`
    );
  });

  const doValidation = $(async () => {
    info.contentTypeFieldsMismatch = false;
    info.missingContentType = false;
    info.spaceLocalesMismatch = false;

    const { source, target, contentType } = store;

    const sourceLocales = await getLocalesSS({
      spaceId: source.spaceId,
      environmentId: source.environmentId as string,
    });
    const targetLocales = await getLocalesSS({
      spaceId: target.spaceId,
      environmentId: target.environmentId as string,
    });

    const targetLocaleCodes = targetLocales?.map((locale) => locale.code);
    const localesToCreate =
      sourceLocales?.filter(
        (locale) => !targetLocaleCodes?.includes(locale.code)
      ) || [];

    info.spaceLocalesMismatch = localesToCreate.length > 0;

    if (localesToCreate.length > 0) {
      const missingLocales = sourceLocales?.filter(
        (locale) => !targetLocales?.includes(locale)
      );

      const missingLocalesString = missingLocales?.map((locale) => locale.code);
      info.missingLocales = missingLocalesString || [];
      createLog(
        `Target space/environment has <b class="error">incompatible locales</b> with source space/environment.`
      );
    }

    const targetContentTypes = await getAllContentTypesSS({
      spaceId: target.spaceId,
      environmentId: target.environmentId as string,
    });
    const sourceContentType = await getAllContentTypesSS({
      spaceId: source.spaceId,
      environmentId: source.environmentId as string,
    }).then((types) => types.find((type) => type.sys.id === contentType));

    const hasContentType = targetContentTypes.some(
      (type) => type.sys.id === contentType
    );
    info.missingContentType = !hasContentType;
    if (!hasContentType)
      createLog(
        `<i>${store.contentType}</i> is <b class="error">missing</b> in the target space.`
      );

    if (!hasContentType) return;
    //check if fields match
    const targetContentType = targetContentTypes.find(
      (type) => type.sys.id === contentType
    );
    const sourceFields = sourceContentType?.fields.map((field) => field.id);
    const targetFields = targetContentType?.fields.map((field) => field.id);
    const hasMatchingFields = sourceFields?.every((field) =>
      targetFields?.includes(field)
    );
    info.contentTypeFieldsMismatch = !hasMatchingFields;
    if (!hasMatchingFields)
      createLog(
        `<i>${store.contentType}</i> in target space/environment has <b class="error">incompatible fields</b>.`
      );
  });

  useTask$(async ({ track }) => {
    track(store);
    if (isServer) {
      return; // Server guard
    }
    const targetEnv = store.target.environmentId;
    const sourceEnv = store.source.environmentId;
    const sourceSpaceId = store.source.spaceId;
    const targetSpaceId = store.target.spaceId;

    info.contentTypeFieldsMismatch = false;
    info.missingContentType = false;
    info.canContinue = false;
    info.contentTypeDependencies = [];

    if (
      targetSpaceId &&
      targetEnv &&
      sourceSpaceId &&
      sourceEnv &&
      store.contentType
    ) {
      await doValidation();

      const allContentTypes = await getAllContentTypesSS({
        spaceId: sourceSpaceId,
        environmentId: sourceEnv,
      });
      const contentTypeDependencies =
        getContentTypeDependencies(allContentTypes).find(
          (type) => type.contentType === store.contentType
        )?.deps || [];

      info.contentTypeDependencies = contentTypeDependencies;
      if (contentTypeDependencies.length > 0) {
        createLog(
          `<i>${store.contentType}</i> <span class="error">has dependencies</span>: <b>${contentTypeDependencies}</b>`
        );
      }

      if (
        !info.missingContentType &&
        !info.contentTypeFieldsMismatch &&
        !info.spaceLocalesMismatch
      ) {
        createLog(
          `<i>${store.contentType}</i> is <b class="success">ready to be copied.</b>`
        );
        info.canContinue = true;
      }
    }
  });

  const migrateLocales = $(async () => {
    info.loading = true;
    await copyLocalesSS({
      sourceSpaceId: store.source.spaceId,
      sourceEnvironmentId: store.source.environmentId as string,
      targetSpaceId: store.target.spaceId,
      targetEnvironmentId: store.target.environmentId as string,
      createLog,
    })
      .then(() => {
        createLog(
          `<b class="success">Locales successfully copied</b> to taget space/environment.`
        );
        info.spaceLocalesMismatch = false;
        info.canContinue = true;
      })
      .catch((err) => {
        createLog(
          `<b class="error">Locales failed to copy</b> to taget space/environment.`
        );
        console.error(err);
      })
      .finally(() => {
        info.loading = false;
      });
  });

  const migrateContentType = $(async () => {
    info.loading = true;
    await copyContentModelSS({
      sourceSpaceId: store.source.spaceId,
      sourceEnvironmentId: store.source.environmentId as string,
      targetSpaceId: store.target.spaceId,
      targetEnvironmentId: store.target.environmentId as string,
      contentType: store.contentType,
    })
      .then(() => {
        createLog(
          `<i>${store.contentType}</i> <b class="success">successfully copied</b> to taget space/environment.`
        );
        info.canContinue = true;
        info.missingContentType = false;
      })
      .catch((err) => {
        createLog(
          `<i>${store.contentType}</i> <b class="error">failed to copy</b> to taget space/environment.`
        );
        console.error(err);
      })
      .finally(() => {
        info.loading = false;
      });
  });

  const migrateContent = $(async () => {
    info.loading = true;

    const sourceSpaceId = store.source.spaceId;
    const sourceEnvironmentId = store.source.environmentId as string;
    const targetSpaceId = store.target.spaceId;
    const targetEnvironmentId = store.target.environmentId as string;
    const contentType = store.contentType;

    try {
      const limitBy = 1000;
      const totalEntries = await getTotalEntriesSS({
        sourceSpaceId,
        sourceEnvironmentId,
        contentType,
      });

    let processedEntries = 0;

		while (processedEntries < totalEntries) {
			const entries = await getEntriesSS({
				contentType,
				sourceSpaceId,
				sourceEnvironmentId,
				skip: processedEntries,
				limit: limitBy,
			});
			if (!entries || entries.length == 0) break;
			for (const [, entry] of entries.entries()) {
				const entryId = entry.sys.id;
				const fields = entry.fields;
				const entryAttributes = {
					content_type_id: contentType,
					fields: fields,
				};
				const isPublished = await isEntryPublishedSS({
					entryId,
					sourceSpaceId,
					sourceEnvironmentId,
				});
				const result = await createEntrySS({
					entryId,
					spaceId: targetSpaceId,
					environmentId: targetEnvironmentId,
					entryAttributes,
					isPublished: isPublished || false,
				});
				const log = `(${processedEntries}/${totalEntries}) - ${result}`;
        createLog(log);
				processedEntries++;
			}
		}
  } catch (err) {
    console.error(err);
  } finally {
    info.loading = false;
  }
  });

  const loadingValue = info.loading;
  return (
    <>
      <div class="section">
        <div
          class={loadingValue ? 'container center loading' : 'container center'}
        >
          <div class="spaceDropdowns">
            <Space state={store} type="source" />
            <Space state={store} type="target" />
          </div>
          <br />
          <ContentTypesDropdown state={store} />
          {info.contentTypeDependencies.length > 0 && (
            <div class="resultContainer">
              <h3 class="resultTitle">
                Caution! This content type has the following dependencies,
                migrate them first:
              </h3>
              <ul class="dependencyTypesList">
                {info.contentTypeDependencies.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </div>
          )}

          {info.canContinue && (
            <div class="resultContainer">
              <h2>
                Content migration for: <i>{store.contentType}</i>
              </h2>
              {/* <h3>Total entries to copy: {totalEntries.value}</h3> */}
              <div class="migrateContainer">
                <div>
                  <h2>Source</h2>
                  <p>Source space: {store.source.spaceName}</p>
                  <p>Source environment: {store.source.environmentId}</p>
                </div>

                <div>
                  <h2>Target</h2>
                  <p>Target space: {store.target.spaceName}</p>
                  <p>Target environment: {store.target.environmentId}</p>
                </div>
              </div>
              <button onClick$={migrateContent} disabled={info.loading}>
                Begin migration
              </button>
            </div>
          )}
          {info.spaceLocalesMismatch && (
            <div class="resultContainer">
              <h3 class="resultTitle">Some locales missing in target space</h3>
              <p>{info.missingLocales.toString()}</p>
              <button onClick$={migrateLocales} disabled={info.loading}>
                Migrate locales
              </button>
            </div>
          )}
          {info.missingContentType && (
            <div class="resultContainer">
              <h3 class="resultTitle">
                Content type does not exist in target space
              </h3>
              <button onClick$={migrateContentType} disabled={info.loading}>
                Migrate content type
              </button>
            </div>
          )}
          {info.contentTypeFieldsMismatch && (
            <div class="resultContainer">
              <h3 class="resultTitle">
                Content type fields do not match! Resolve manually.
              </h3>
              <a
                href={`https://app.contentful.com/spaces/${store.target.spaceId}/environments/${store.target.environmentId}/content_types/${store.contentType}/fields`}
                target="_blank"
                rel="noreferrer"
              >
                Open content type in target space
              </a>
              <br />
              <a
                href={`https://app.contentful.com/spaces/${store.source.spaceId}/environments/${store.source.environmentId}/content_types/${store.contentType}/fields`}
                target="_blank"
                rel="noreferrer"
              >
                Open content type in source space
              </a>
            </div>
          )}
        </div>
      </div>
      {logs.length > 0 && (
        <div class="logs">
          {logs
            .slice()
            .reverse()
            .map((log, index) => (
              <p
                key={index}
                style={{ margin: 0 }}
                dangerouslySetInnerHTML={log}
              />
            ))}
        </div>
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: 'Migrate content',
};
