import { server$ } from "@builder.io/qwik-city";
import { copyContent, createEntry, getEntries, getTotalEntries, isEntryPublished } from "~/contentful-migrate/content";
import { copyContentModel, getAllContentTypes } from "~/contentful-migrate/model";
import { copyLocales, getLocales } from "~/contentful-migrate/space";

export const getTotalEntriesSS = server$(
    async ({
      sourceSpaceId,
      sourceEnvironmentId,
      contentType,
    }: {
      sourceSpaceId: string;
      sourceEnvironmentId: string;
      contentType: string;
    }) => await getTotalEntries({
        spaceId: sourceSpaceId,
        environmentId: sourceEnvironmentId,
        contentType,
      })
  );

  export const getEntriesSS = server$(
    async ({
        sourceSpaceId,
        sourceEnvironmentId,
        contentType,
        skip,
        limit,
    }: {
        sourceSpaceId: string;
        sourceEnvironmentId: string;
        contentType: string;
        skip: number;
        limit: number;
    }) => await getEntries({
        spaceId: sourceSpaceId,
        environmentId: sourceEnvironmentId,
        contentType,
        skip,
        limit,
        })
    );

    export const isEntryPublishedSS = server$(
        async ({
            sourceSpaceId,
            sourceEnvironmentId,
            entryId,
        }: {
            sourceSpaceId: string;
            sourceEnvironmentId: string;
            entryId: string;
        }) => await isEntryPublished({
            spaceId: sourceSpaceId,
            environmentId: sourceEnvironmentId,
            entryId,
            })
        );


  export const copyContentSS = server$(
    async ({
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
    }) =>
      await copyContent({
        sourceSpaceId,
        sourceEnvironmentId,
        targetSpaceId,
        targetEnvironmentId,
        contentType,
      })
  );


  export const copyContentModelSS = server$(
    async ({
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
    }) =>
      await copyContentModel({
        sourceSpaceId,
        sourceEnvironmentId,
        targetSpaceId,
        targetEnvironmentId,
        contentType,
      })
  );


  export const copyLocalesSS = server$(
    async ({
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
      createLog: (log: string) => void;
    }) =>
      await copyLocales({
        sourceSpaceId,
        sourceEnvironmentId,
        targetSpaceId,
        targetEnvironmentId,
        createLog,
      })
  );
  

  export const getLocalesSS = server$(
    async ({
      spaceId,
      environmentId,
    }: {
      spaceId: string;
      environmentId: string;
    }) => await getLocales({
        spaceId,
        environmentId,
      })
  );
  
  export const getAllContentTypesSS = server$(
    async ({
      spaceId,
      environmentId,
    }: {
      spaceId: string;
      environmentId: string;
    }) => await getAllContentTypes({
        spaceId,
        environmentId,
      })
  );
  
  export const createEntrySS = server$(
    async ({
        entryId,
        spaceId,
        environmentId,
        entryAttributes,
        isPublished,
    }: {
        entryId: string;
        spaceId: string;
        environmentId: string;
        entryAttributes: any;
        isPublished: boolean;
    }) => await createEntry({
        entryId,
        spaceId,
        environmentId,
        entryAttributes,
        isPublished,
    })
    );