import type { Locale } from 'contentful-management/types';
import { getClient } from './client';

export const getSpaces = async () => {
  try {
    const managementClient = await getClient();
    const spaces = await managementClient.getSpaces();
    return spaces.items;
  } catch (e) {
    console.error(
      `Error fetching spaces from the Content Management API: ${e}`
    );
  }
};

export const getEnvironments = async ({ spaceId }: { spaceId: string }) => {
  try {
    const managementClient = await getClient();
    const environments = await managementClient
      .getSpace(spaceId)
      .then((space) => space.getEnvironments());
    return environments.items;
  } catch (e) {
    console.error(
      `Error fetching environments from the Content Management API: ${e}`
    );
  }
};

export const getLocales = async ({
  spaceId,
  environmentId,
}: {
  spaceId: string;
  environmentId: string;
}) => {
  try {
    const managementClient = await getClient();
    const locales = await managementClient
      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) => environment.getLocales());
    return locales.items;
  } catch (e) {
    console.error(
      `Error fetching locales from the Content Management API: ${e}`
    );
  }
};

export const createLocale = async ({
  spaceId,
  environmentId,
  locale,
}: {
  spaceId: string;
  environmentId: string;
  locale: Locale;
}) => {
  try {
    const managementClient = await getClient();
    const createdLocale = await managementClient

      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) =>
        environment.createLocale({
          code: locale.code,
          name: locale.name,
          fallbackCode: locale.fallbackCode,
          optional: locale.optional,
        })
      );
    return createdLocale;
  } catch (e) {
    console.error(
      `Error creating locale from the Content Management API: ${e}`
    );
  }
};

export const copyLocales = async ({
  sourceSpaceId,
  sourceEnvironmentId,
  targetSpaceId,
  targetEnvironmentId,
  createLog,
}: {
  sourceSpaceId: string;
  sourceEnvironmentId: string;
  targetSpaceId: string;
  targetEnvironmentId: string;
  createLog?: (log: string) => void;
}) => {
  try {
    const sourceLocales = await getLocales({
      spaceId: sourceSpaceId,
      environmentId: sourceEnvironmentId,
    });
    const targetLocales = await getLocales({
      spaceId: targetSpaceId,
      environmentId: targetEnvironmentId,
    });

    const targetLocaleCodes = targetLocales?.map((locale) => locale.code);
    const localesToCreate = sourceLocales?.filter(
      (locale) => !targetLocaleCodes?.includes(locale.code)
    );
    createLog?.(
      `Creating these locales in target environment: ${localesToCreate
        ?.map((locale) => locale.code)
        .join(', ')}`
    );

    if (localesToCreate) {
      const promises = localesToCreate.map((locale) =>
        createLocale({
          spaceId: targetSpaceId,
          environmentId: targetEnvironmentId,
          locale,
        })
          .then((createdLocale) => {
            createLog?.(`Locale created: ${createdLocale?.code}`);
            console.log('createdLocale', createdLocale);
          })
          .catch((e) => {
            createLog?.(`Failed to create locale: ${locale?.code}`);
            console.error(
              `Error creating locale from the Content Management API: ${e}`
            );
          })
      );

      Promise.all(promises)
        .then(() => {
          console.log('All locales created successfully.');
        })
        .catch((error) => {
          console.error('Error creating one or more locales:', error);
        });
    }

    return localesToCreate;
  } catch (e) {
    console.error(
      `Error copying locales from the Content Management API: ${e}`
    );
  }
};
